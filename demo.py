#!/usr/bin/env python3
"""
환상의 세계 MUD - 데모 버전
Textual 없이 기본 터미널에서 실행되는 버전
"""

import os
import time
import random
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


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


def clear_screen():
    """화면 지우기"""
    os.system('cls' if os.name == 'nt' else 'clear')


def print_header():
    """헤더 출력"""
    print("=" * 80)
    print("                              환상의 세계 MUD")
    print("=" * 80)


def print_character_panel(game: GameState):
    """캐릭터 정보 패널 출력"""
    print("┌─────────────────┐")
    print("│   캐릭터 정보    │")
    print("│                 │")
    print(f"│ 레벨: {game.player_level:<10} │")
    print(f"│ 체력: {game.player_hp}/{game.player_max_hp:<8} │")
    print(f"│ 경험치: {game.player_exp}/{game.player_exp_needed:<6} │")
    print(f"│ 공격력: {game.player_attack:<9} │")
    print(f"│ 방어력: {game.player_defense:<9} │")
    print(f"│ 골드: {game.player_gold:<11} │")
    print("│                 │")
    print("└─────────────────┘")


def print_room_panel(game: GameState):
    """방 정보 패널 출력"""
    room = game.get_current_room()
    print("┌─────────────────┐")
    print("│   현재 위치     │")
    print("│                 │")
    print(f"│ 장소: {room.name:<10} │")
    print("│ 설명: " + room.description[:10] + "│")
    exits_text = ", ".join([exit.value for exit in room.exits.keys()])
    print(f"│ 출구: {exits_text:<10} │")
    items_text = ", ".join([item.name for item in room.items]) if room.items else "없음"
    print(f"│ 아이템: {items_text[:8]:<8} │")
    monsters_text = ", ".join([monster.name for monster in room.monsters]) if room.monsters else "없음"
    print(f"│ 몬스터: {monsters_text[:8]:<8} │")
    print("│                 │")
    print("└─────────────────┘")


def print_combat_panel(game: GameState):
    """전투 패널 출력"""
    print("┌─────────────────┐")
    print("│   [전투 패널]   │")
    print("│                 │")
    if game.in_combat and game.current_monster:
        monster = game.current_monster
        print(f"│ {monster.name} (HP:     │")
        print(f"│       {monster.hp}/{monster.max_hp})     │")
    else:
        print("│ 전투 중이       │")
        print("│ 아닙니다        │")
    print("│                 │")
    print("│ [공격] [도망]   │")
    print("└─────────────────┘")


def print_game_interface(game: GameState, log_messages: List[str]):
    """게임 인터페이스 출력"""
    clear_screen()
    print_header()
    print()
    
    # 왼쪽 패널 - 캐릭터 정보
    print_character_panel(game)
    print()
    
    # 중앙 패널 - 게임 로그
    print("┌─────────────────────────────────────────────────────────────────────┐")
    print("│                    게임 로그                                        │")
    print("│                                                                     │")
    
    # 최근 로그 메시지들 출력
    recent_messages = log_messages[-15:]  # 최근 15개 메시지만 표시
    for message in recent_messages:
        if len(message) > 65:
            message = message[:62] + "..."
        print(f"│ {message:<65} │")
    
    # 빈 줄로 채우기
    remaining_lines = 15 - len(recent_messages)
    for _ in range(remaining_lines):
        print("│                                                                     │")
    
    print("│                                                                     │")
    print("│ [명령어를 입력하세요...]                                             │")
    print("└─────────────────────────────────────────────────────────────────────┘")
    
    # 오른쪽 패널 - 방 정보 및 전투
    print_room_panel(game)
    print()
    print_combat_panel(game)
    print()


def show_help():
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
    return help_text.strip().split('\n')


def process_command(game: GameState, command: str) -> str:
    """명령어 처리"""
    if command in ["북", "n", "north"]:
        if game.move(Direction.NORTH):
            return "북쪽으로 이동했습니다."
        else:
            return "북쪽으로 갈 수 없습니다."
    
    elif command in ["남", "s", "south"]:
        if game.move(Direction.SOUTH):
            return "남쪽으로 이동했습니다."
        else:
            return "남쪽으로 갈 수 없습니다."
    
    elif command in ["동", "e", "east"]:
        if game.move(Direction.EAST):
            return "동쪽으로 이동했습니다."
        else:
            return "동쪽으로 갈 수 없습니다."
    
    elif command in ["서", "w", "west"]:
        if game.move(Direction.WEST):
            return "서쪽으로 이동했습니다."
        else:
            return "서쪽으로 갈 수 없습니다."
    
    elif command in ["공격", "attack", "a"]:
        if game.in_combat:
            return game.attack_monster()
        else:
            return "전투 중이 아닙니다."
    
    elif command in ["도망", "flee", "f"]:
        if game.in_combat:
            return game.flee_combat()
        else:
            return "전투 중이 아닙니다."
    
    elif command in ["주변", "look", "l"]:
        room = game.get_current_room()
        return f"=== {room.name} ===\n{room.description}"
    
    elif command in ["줍기", "get", "g"]:
        room = game.get_current_room()
        if room.items:
            item = room.items[0]
            return game.pick_up_item(item)
        else:
            return "줍을 아이템이 없습니다."
    
    elif command in ["인벤토리", "inventory", "i"]:
        if game.inventory:
            result = "=== 인벤토리 ===\n"
            for i, item in enumerate(game.inventory, 1):
                result += f"{i}. {item.name} - {item.description}\n"
            return result.strip()
        else:
            return "인벤토리가 비어있습니다."
    
    elif command in ["사용", "use", "u"]:
        if game.inventory:
            item = game.inventory[0]
            return game.use_item(item)
        else:
            return "사용할 아이템이 없습니다."
    
    elif command in ["도움말", "help", "h", "?"]:
        return "\n".join(show_help())
    
    elif command in ["종료", "quit", "q", "exit"]:
        return "게임을 종료합니다."
    
    else:
        return f"알 수 없는 명령어: {command}"


def check_room_events(game: GameState) -> str:
    """방 진입 시 이벤트 체크"""
    room = game.get_current_room()
    
    # 몬스터와 조우
    if room.monsters and not game.in_combat:
        monster = random.choice(room.monsters)
        game.start_combat(monster)
        return f"!!! {monster.name}이(가) 나타났습니다! !!!\n{monster.description}"
    
    return ""


def main():
    """메인 게임 루프"""
    print("🎮 환상의 세계 MUD에 오신 것을 환영합니다!")
    print("도움말을 보려면 '도움말'을 입력하세요.")
    print("게임을 시작하려면 아무 키나 누르세요...")
    input()
    
    game = GameState()
    log_messages = [
        "환상의 세계 MUD에 오신 것을 환영합니다!",
        "도움말을 보려면 '도움말'을 입력하세요."
    ]
    
    while True:
        print_game_interface(game, log_messages)
        
        # 명령어 입력
        command = input("명령어: ").strip().lower()
        
        if not command:
            continue
        
        # 명령어 처리
        result = process_command(game, command)
        
        # 결과를 로그에 추가
        log_messages.append(f"> {command}")
        for line in result.split('\n'):
            if line.strip():
                log_messages.append(line)
        
        # 방 이벤트 체크
        event_result = check_room_events(game)
        if event_result:
            for line in event_result.split('\n'):
                if line.strip():
                    log_messages.append(line)
        
        # 게임 종료 체크
        if command in ["종료", "quit", "q", "exit"]:
            break
        
        # 잠시 대기
        time.sleep(0.5)
    
    print("게임을 종료합니다. 다시 플레이해주세요!")


if __name__ == "__main__":
    main()