#!/usr/bin/env python3
"""
환상의 세계 MUD - Textual 기반 텍스트 RPG 게임
"""

import random
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import (
    Header, Footer, Static, Button, DataTable, 
    Input, Label, ProgressBar, Log, TextArea
)
from textual.widgets.data_table import RowKey
from textual.reactive import reactive
from textual import work
from rich.text import Text
from rich.console import Console
from rich.panel import Panel
from rich.align import Align


class Direction(Enum):
    NORTH = "북"
    SOUTH = "남"
    EAST = "동"
    WEST = "서"


class ItemType(Enum):
    WEAPON = "무기"
    ARMOR = "방어구"
    POTION = "물약"
    TREASURE = "보물"


@dataclass
class Item:
    name: str
    item_type: ItemType
    attack: int = 0
    defense: int = 0
    heal: int = 0
    value: int = 0
    description: str = ""


@dataclass
class Monster:
    name: str
    hp: int
    max_hp: int
    attack: int
    defense: int
    exp_reward: int
    gold_reward: int
    description: str = ""


@dataclass
class Room:
    name: str
    description: str
    exits: Dict[Direction, str]
    items: List[Item]
    monsters: List[Monster]
    npcs: List[str]
    is_safe: bool = False


class GameState:
    def __init__(self):
        self.player_level = 1
        self.player_hp = 100
        self.player_max_hp = 100
        self.player_exp = 0
        self.player_exp_needed = 100
        self.player_attack = 10
        self.player_defense = 5
        self.player_gold = 0
        self.current_room_id = "start_village"
        self.inventory: List[Item] = []
        self.equipped_weapon: Optional[Item] = None
        self.equipped_armor: Optional[Item] = None
        self.in_combat = False
        self.current_monster: Optional[Monster] = None
        
        # 게임 데이터 초기화
        self._init_items()
        self._init_monsters()
        self._init_world()
    
    def _init_items(self):
        """아이템 데이터 초기화"""
        self.items_database = {
            "rusty_sword": Item("녹슨 검", ItemType.WEAPON, attack=5, value=10, description="오래된 검입니다."),
            "iron_sword": Item("철검", ItemType.WEAPON, attack=15, value=50, description="견고한 철검입니다."),
            "leather_armor": Item("가죽 갑옷", ItemType.ARMOR, defense=3, value=20, description="가벼운 가죽 갑옷입니다."),
            "iron_armor": Item("철갑옷", ItemType.ARMOR, defense=8, value=80, description="견고한 철갑옷입니다."),
            "health_potion": Item("체력 물약", ItemType.POTION, heal=50, value=15, description="체력을 회복시킵니다."),
            "gold_coin": Item("금화", ItemType.TREASURE, value=100, description="빛나는 금화입니다."),
        }
    
    def _init_monsters(self):
        """몬스터 데이터 초기화"""
        self.monsters_database = {
            "goblin": Monster("고블린", 30, 30, 8, 2, 20, 15, "작고 교활한 고블린입니다."),
            "orc": Monster("오크", 60, 60, 15, 5, 40, 30, "강력한 오크 전사입니다."),
            "troll": Monster("트롤", 100, 100, 25, 10, 80, 60, "거대하고 무서운 트롤입니다."),
            "dragon": Monster("드래곤", 200, 200, 40, 20, 200, 150, "전설의 드래곤입니다!"),
        }
    
    def _init_world(self):
        """월드 맵 초기화"""
        self.world = {
            "start_village": Room(
                name="시작의 마을",
                description="평화로운 마을입니다. 모험의 시작점입니다.",
                exits={Direction.NORTH: "north_forest", Direction.EAST: "east_road"},
                items=[self.items_database["health_potion"]],
                monsters=[],
                npcs=["마을장로"],
                is_safe=True
            ),
            "north_forest": Room(
                name="북쪽 숲",
                description="어두운 숲입니다. 위험한 생물들이 숨어있을 수 있습니다.",
                exits={Direction.SOUTH: "start_village", Direction.NORTH: "dark_cave"},
                items=[self.items_database["rusty_sword"]],
                monsters=[self.monsters_database["goblin"]],
                npcs=[],
                is_safe=False
            ),
            "east_road": Room(
                name="동쪽 길",
                description="넓은 길입니다. 먼 곳으로 이어집니다.",
                exits={Direction.WEST: "start_village", Direction.EAST: "mountain_pass"},
                items=[],
                monsters=[self.monsters_database["orc"]],
                npcs=[],
                is_safe=False
            ),
            "dark_cave": Room(
                name="어두운 동굴",
                description="깊고 어두운 동굴입니다. 무서운 기운이 느껴집니다.",
                exits={Direction.SOUTH: "north_forest"},
                items=[self.items_database["iron_sword"], self.items_database["gold_coin"]],
                monsters=[self.monsters_database["troll"]],
                npcs=[],
                is_safe=False
            ),
            "mountain_pass": Room(
                name="산길",
                description="험한 산길입니다. 바람이 거세게 불어옵니다.",
                exits={Direction.WEST: "east_road", Direction.NORTH: "dragon_lair"},
                items=[self.items_database["iron_armor"]],
                monsters=[self.monsters_database["orc"], self.monsters_database["troll"]],
                npcs=[],
                is_safe=False
            ),
            "dragon_lair": Room(
                name="드래곤의 둥지",
                description="전설의 드래곤이 살고 있다는 무시무시한 곳입니다.",
                exits={Direction.SOUTH: "mountain_pass"},
                items=[self.items_database["gold_coin"], self.items_database["gold_coin"]],
                monsters=[self.monsters_database["dragon"]],
                npcs=[],
                is_safe=False
            ),
        }
    
    def get_current_room(self) -> Room:
        return self.world[self.current_room_id]
    
    def move(self, direction: Direction) -> bool:
        """플레이어 이동"""
        current_room = self.get_current_room()
        if direction in current_room.exits:
            self.current_room_id = current_room.exits[direction]
            return True
        return False
    
    def attack_monster(self) -> str:
        """몬스터 공격"""
        if not self.in_combat or not self.current_monster:
            return "전투 중이 아닙니다."
        
        # 플레이어 공격
        damage = max(1, self.player_attack - self.current_monster.defense)
        self.current_monster.hp -= damage
        
        result = f"당신이 {self.current_monster.name}에게 {damage}의 피해를 입혔습니다!"
        
        # 몬스터가 죽었는지 확인
        if self.current_monster.hp <= 0:
            exp_gain = self.current_monster.exp_reward
            gold_gain = self.current_monster.gold_reward
            self.player_exp += exp_gain
            self.player_gold += gold_gain
            
            result += f"\n{self.current_monster.name}을(를) 물리쳤습니다!"
            result += f"\n경험치 {exp_gain} 획득! 골드 {gold_gain} 획득!"
            
            # 레벨업 체크
            if self.player_exp >= self.player_exp_needed:
                self.level_up()
            
            self.in_combat = False
            self.current_monster = None
            return result
        
        # 몬스터 반격
        monster_damage = max(1, self.current_monster.attack - self.player_defense)
        self.player_hp -= monster_damage
        
        result += f"\n{self.current_monster.name}이(가) 당신에게 {monster_damage}의 피해를 입혔습니다!"
        
        # 플레이어가 죽었는지 확인
        if self.player_hp <= 0:
            self.player_hp = 1
            self.in_combat = False
            self.current_monster = None
            result += "\n치명적인 공격을 받았지만 간신히 살아남았습니다!"
        
        return result
    
    def level_up(self):
        """레벨업"""
        self.player_level += 1
        self.player_exp -= self.player_exp_needed
        self.player_exp_needed = int(self.player_exp_needed * 1.5)
        self.player_max_hp += 20
        self.player_hp = self.player_max_hp
        self.player_attack += 3
        self.player_defense += 2
    
    def start_combat(self, monster: Monster):
        """전투 시작"""
        self.in_combat = True
        self.current_monster = monster
    
    def flee_combat(self) -> str:
        """전투에서 도망"""
        if not self.in_combat:
            return "전투 중이 아닙니다."
        
        if random.random() < 0.7:  # 70% 확률로 도망 성공
            self.in_combat = False
            self.current_monster = None
            return "성공적으로 도망쳤습니다!"
        else:
            return "도망에 실패했습니다!"
    
    def pick_up_item(self, item: Item) -> str:
        """아이템 줍기"""
        self.inventory.append(item)
        current_room = self.get_current_room()
        if item in current_room.items:
            current_room.items.remove(item)
        return f"{item.name}을(를) 획득했습니다!"
    
    def use_item(self, item: Item) -> str:
        """아이템 사용"""
        if item.item_type == ItemType.POTION:
            if item.heal > 0:
                self.player_hp = min(self.player_max_hp, self.player_hp + item.heal)
                self.inventory.remove(item)
                return f"{item.name}을(를) 사용하여 체력을 회복했습니다!"
        elif item.item_type == ItemType.WEAPON:
            self.equipped_weapon = item
            return f"{item.name}을(를) 장착했습니다!"
        elif item.item_type == ItemType.ARMOR:
            self.equipped_armor = item
            return f"{item.name}을(를) 장착했습니다!"
        
        return f"{item.name}을(를) 사용할 수 없습니다."


class CharacterPanel(Static):
    """캐릭터 정보 패널"""
    
    def __init__(self, game_state: GameState):
        super().__init__()
        self.game_state = game_state
    
    def compose(self) -> ComposeResult:
        with Container(classes="character-panel"):
            yield Label("캐릭터 정보", classes="panel-title")
            yield Label(f"레벨: {self.game_state.player_level}", id="level-label")
            yield Label(f"체력: {self.game_state.player_hp}/{self.game_state.player_max_hp}", id="hp-label")
            yield Label(f"경험치: {self.game_state.player_exp}/{self.game_state.player_exp_needed}", id="exp-label")
            yield Label(f"공격력: {self.game_state.player_attack}", id="attack-label")
            yield Label(f"방어력: {self.game_state.player_defense}", id="defense-label")
            yield Label(f"골드: {self.game_state.player_gold}", id="gold-label")
    
    def update_stats(self):
        """스탯 업데이트"""
        self.query_one("#level-label").update(f"레벨: {self.game_state.player_level}")
        self.query_one("#hp-label").update(f"체력: {self.game_state.player_hp}/{self.game_state.player_max_hp}")
        self.query_one("#exp-label").update(f"경험치: {self.game_state.player_exp}/{self.game_state.player_exp_needed}")
        self.query_one("#attack-label").update(f"공격력: {self.game_state.player_attack}")
        self.query_one("#defense-label").update(f"방어력: {self.game_state.player_defense}")
        self.query_one("#gold-label").update(f"골드: {self.game_state.player_gold}")


class RoomPanel(Static):
    """방 정보 패널"""
    
    def __init__(self, game_state: GameState):
        super().__init__()
        self.game_state = game_state
    
    def compose(self) -> ComposeResult:
        with Container(classes="room-panel"):
            yield Label("현재 위치", classes="panel-title")
            yield Label("", id="room-name-label")
            yield Label("", id="room-description-label")
            yield Label("", id="room-exits-label")
            yield Label("", id="room-items-label")
            yield Label("", id="room-monsters-label")
    
    def update_room(self):
        """방 정보 업데이트"""
        room = self.game_state.get_current_room()
        self.query_one("#room-name-label").update(f"장소: {room.name}")
        self.query_one("#room-description-label").update(f"설명: {room.description}")
        
        exits_text = ", ".join([exit.value for exit in room.exits.keys()])
        self.query_one("#room-exits-label").update(f"출구: {exits_text}")
        
        items_text = ", ".join([item.name for item in room.items]) if room.items else "없음"
        self.query_one("#room-items-label").update(f"아이템: {items_text}")
        
        monsters_text = ", ".join([monster.name for monster in room.monsters]) if room.monsters else "없음"
        self.query_one("#room-monsters-label").update(f"몬스터: {monsters_text}")


class CombatPanel(Static):
    """전투 패널"""
    
    def __init__(self, game_state: GameState):
        super().__init__()
        self.game_state = game_state
    
    def compose(self) -> ComposeResult:
        with Container(classes="combat-panel"):
            yield Label("전투", classes="panel-title")
            yield Label("", id="combat-status-label")
            yield Button("공격", id="attack-button", classes="combat-button")
            yield Button("도망", id="flee-button", classes="combat-button")
    
    def update_combat(self):
        """전투 상태 업데이트"""
        if self.game_state.in_combat and self.game_state.current_monster:
            monster = self.game_state.current_monster
            status_text = f"{monster.name} (HP: {monster.hp}/{monster.max_hp})"
            self.query_one("#combat-status-label").update(status_text)
            self.add_class("visible")
        else:
            self.remove_class("visible")


class GameLog(Log):
    """게임 로그"""
    
    def __init__(self):
        super().__init__()
        self.styles.background = "black"
        self.styles.color = "white"
        self.styles.height = "20"
    
    def add_message(self, message: str):
        """메시지 추가"""
        self.write(message)


class MUDGame(App):
    """메인 MUD 게임 애플리케이션"""
    
    CSS = """
    Screen {
        background: $surface;
    }
    
    .character-panel, .room-panel, .combat-panel {
        background: $boost;
        border: solid $accent;
        height: 100%;
        padding: 1;
    }
    
    .panel-title {
        text-style: bold;
        color: $accent;
        margin-bottom: 1;
    }
    
    .combat-button {
        margin: 1;
        width: 100%;
    }
    
    .combat-panel {
        display: none;
    }
    
    .combat-panel.visible {
        display: block;
    }
    
    #game-log {
        background: black;
        color: white;
        height: 20;
        border: solid $accent;
    }
    
    #command-input {
        background: $boost;
        border: solid $accent;
        margin-top: 1;
    }
    """
    
    def __init__(self):
        super().__init__()
        self.game_state = GameState()
        self.game_log = GameLog()
    
    def compose(self) -> ComposeResult:
        """UI 구성"""
        yield Header(show_clock=True)
        
        with Container():
            with Horizontal():
                # 왼쪽 패널 - 캐릭터 정보
                yield CharacterPanel(self.game_state)
                
                # 중앙 패널 - 게임 로그
                with Vertical():
                    yield self.game_log
                    yield Input(placeholder="명령어를 입력하세요...", id="command-input")
                
                # 오른쪽 패널 - 방 정보 및 전투
                with Vertical():
                    yield RoomPanel(self.game_state)
                    yield CombatPanel(self.game_state)
        
        yield Footer()
    
    def on_mount(self) -> None:
        """앱 마운트 시 초기화"""
        self.game_log.add_message("환상의 세계 MUD에 오신 것을 환영합니다!")
        self.game_log.add_message("도움말을 보려면 '도움말'을 입력하세요.")
        self.update_ui()
    
    def on_input_submitted(self, event: Input.Submitted) -> None:
        """명령어 입력 처리"""
        command = event.value.strip().lower()
        event.input.value = ""
        
        if not command:
            return
        
        self.process_command(command)
    
    def process_command(self, command: str):
        """명령어 처리"""
        if command in ["북", "n", "north"]:
            if self.game_state.move(Direction.NORTH):
                self.game_log.add_message("북쪽으로 이동했습니다.")
                self.check_room_events()
            else:
                self.game_log.add_message("북쪽으로 갈 수 없습니다.")
        
        elif command in ["남", "s", "south"]:
            if self.game_state.move(Direction.SOUTH):
                self.game_log.add_message("남쪽으로 이동했습니다.")
                self.check_room_events()
            else:
                self.game_log.add_message("남쪽으로 갈 수 없습니다.")
        
        elif command in ["동", "e", "east"]:
            if self.game_state.move(Direction.EAST):
                self.game_log.add_message("동쪽으로 이동했습니다.")
                self.check_room_events()
            else:
                self.game_log.add_message("동쪽으로 갈 수 없습니다.")
        
        elif command in ["서", "w", "west"]:
            if self.game_state.move(Direction.WEST):
                self.game_log.add_message("서쪽으로 이동했습니다.")
                self.check_room_events()
            else:
                self.game_log.add_message("서쪽으로 갈 수 없습니다.")
        
        elif command in ["공격", "attack", "a"]:
            if self.game_state.in_combat:
                result = self.game_state.attack_monster()
                self.game_log.add_message(result)
            else:
                self.game_log.add_message("전투 중이 아닙니다.")
        
        elif command in ["도망", "flee", "f"]:
            if self.game_state.in_combat:
                result = self.game_state.flee_combat()
                self.game_log.add_message(result)
            else:
                self.game_log.add_message("전투 중이 아닙니다.")
        
        elif command in ["주변", "look", "l"]:
            room = self.game_state.get_current_room()
            self.game_log.add_message(f"=== {room.name} ===")
            self.game_log.add_message(room.description)
            if room.items:
                items_text = ", ".join([item.name for item in room.items])
                self.game_log.add_message(f"아이템: {items_text}")
            if room.monsters:
                monsters_text = ", ".join([monster.name for monster in room.monsters])
                self.game_log.add_message(f"몬스터: {monsters_text}")
        
        elif command in ["줍기", "get", "g"]:
            room = self.game_state.get_current_room()
            if room.items:
                item = room.items[0]  # 첫 번째 아이템 줍기
                result = self.game_state.pick_up_item(item)
                self.game_log.add_message(result)
            else:
                self.game_log.add_message("줍을 아이템이 없습니다.")
        
        elif command in ["인벤토리", "inventory", "i"]:
            if self.game_state.inventory:
                self.game_log.add_message("=== 인벤토리 ===")
                for i, item in enumerate(self.game_state.inventory, 1):
                    self.game_log.add_message(f"{i}. {item.name} - {item.description}")
            else:
                self.game_log.add_message("인벤토리가 비어있습니다.")
        
        elif command in ["사용", "use", "u"]:
            if self.game_state.inventory:
                item = self.game_state.inventory[0]  # 첫 번째 아이템 사용
                result = self.game_state.use_item(item)
                self.game_log.add_message(result)
            else:
                self.game_log.add_message("사용할 아이템이 없습니다.")
        
        elif command in ["도움말", "help", "h", "?"]:
            self.show_help()
        
        elif command in ["종료", "quit", "q", "exit"]:
            self.exit()
        
        else:
            self.game_log.add_message(f"알 수 없는 명령어: {command}")
        
        self.update_ui()
    
    def check_room_events(self):
        """방 진입 시 이벤트 체크"""
        room = self.game_state.get_current_room()
        
        # 몬스터와 조우
        if room.monsters and not self.game_state.in_combat:
            monster = random.choice(room.monsters)
            self.game_state.start_combat(monster)
            self.game_log.add_message(f"!!! {monster.name}이(가) 나타났습니다! !!!")
            self.game_log.add_message(f"{monster.description}")
    
    def show_help(self):
        """도움말 표시"""
        help_text = """
=== 환상의 세계 MUD 도움말 ===

이동 명령어:
  북/남/동/서, n/s/e/w, north/south/east/west

전투 명령어:
  공격/attack/a - 몬스터 공격
  도망/flee/f - 전투에서 도망

기타 명령어:
  주변/look/l - 주변 탐색
  줍기/get/g - 아이템 줍기
  인벤토리/inventory/i - 인벤토리 확인
  사용/use/u - 아이템 사용
  도움말/help/h - 이 도움말 표시
  종료/quit/q - 게임 종료

게임 목표:
  - 몬스터를 물리쳐 경험치와 골드를 획득하세요
  - 레벨업하여 더 강해지세요
  - 드래곤을 물리쳐 전설의 영웅이 되세요!
        """
        for line in help_text.strip().split('\n'):
            self.game_log.add_message(line)
    
    def update_ui(self):
        """UI 업데이트"""
        # 캐릭터 패널 업데이트
        character_panel = self.query_one(CharacterPanel)
        character_panel.update_stats()
        
        # 방 패널 업데이트
        room_panel = self.query_one(RoomPanel)
        room_panel.update_room()
        
        # 전투 패널 업데이트
        combat_panel = self.query_one(CombatPanel)
        combat_panel.update_combat()
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        """버튼 클릭 처리"""
        if event.button.id == "attack-button":
            self.process_command("공격")
        elif event.button.id == "flee-button":
            self.process_command("도망")


if __name__ == "__main__":
    app = MUDGame()
    app.run()