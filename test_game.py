#!/usr/bin/env python3
"""
환상의 세계 MUD - 테스트 스크립트
Textual 없이 게임 로직만 테스트
"""

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


def test_game():
    """게임 테스트"""
    print("=== 환상의 세계 MUD 테스트 ===")
    
    # 게임 상태 초기화
    game = GameState()
    
    # 초기 상태 출력
    print(f"초기 위치: {game.get_current_room().name}")
    print(f"플레이어 레벨: {game.player_level}")
    print(f"플레이어 HP: {game.player_hp}/{game.player_max_hp}")
    print(f"플레이어 공격력: {game.player_attack}")
    print(f"플레이어 방어력: {game.player_defense}")
    print(f"플레이어 골드: {game.player_gold}")
    
    # 북쪽으로 이동 테스트
    print("\n=== 이동 테스트 ===")
    if game.move(Direction.NORTH):
        print("북쪽으로 이동 성공!")
        room = game.get_current_room()
        print(f"현재 위치: {room.name}")
        print(f"설명: {room.description}")
        print(f"출구: {[exit.value for exit in room.exits.keys()]}")
        print(f"아이템: {[item.name for item in room.items]}")
        print(f"몬스터: {[monster.name for monster in room.monsters]}")
        
        # 몬스터 조우 테스트
        if room.monsters:
            monster = room.monsters[0]
            print(f"\n!!! {monster.name}이(가) 나타났습니다! !!!")
            game.start_combat(monster)
            
            # 전투 테스트
            print("\n=== 전투 테스트 ===")
            while game.in_combat and game.current_monster:
                result = game.attack_monster()
                print(result)
                if game.current_monster and game.current_monster.hp > 0:
                    print(f"몬스터 HP: {game.current_monster.hp}/{game.current_monster.max_hp}")
                    print(f"플레이어 HP: {game.player_hp}/{game.player_max_hp}")
    
    # 아이템 줍기 테스트
    print("\n=== 아이템 테스트 ===")
    room = game.get_current_room()
    if room.items:
        item = room.items[0]
        result = game.pick_up_item(item)
        print(result)
        print(f"인벤토리: {[item.name for item in game.inventory]}")
        
        # 아이템 사용 테스트
        result = game.use_item(item)
        print(result)
    
    # 최종 상태 출력
    print("\n=== 최종 상태 ===")
    print(f"플레이어 레벨: {game.player_level}")
    print(f"플레이어 HP: {game.player_hp}/{game.player_max_hp}")
    print(f"플레이어 공격력: {game.player_attack}")
    print(f"플레이어 방어력: {game.player_defense}")
    print(f"플레이어 골드: {game.player_gold}")
    print(f"인벤토리: {[item.name for item in game.inventory]}")
    
    print("\n=== 테스트 완료 ===")
    print("게임 로직이 정상적으로 작동합니다!")


if __name__ == "__main__":
    test_game()