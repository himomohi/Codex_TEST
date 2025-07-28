#!/bin/bash

# 환상의 세계 MUD 설치 스크립트

echo "🎮 환상의 세계 MUD 설치를 시작합니다..."
echo ""

# Python 버전 확인
echo "📋 Python 버전 확인 중..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3이 설치되어 있지 않습니다."
    echo "Python 3.8 이상을 설치해주세요."
    exit 1
fi

# 가상환경 생성
echo ""
echo "🔧 가상환경 생성 중..."
python3 -m venv mud_env
if [ $? -ne 0 ]; then
    echo "❌ 가상환경 생성에 실패했습니다."
    echo "python3-venv 패키지를 설치해주세요:"
    echo "  sudo apt install python3-venv"
    exit 1
fi

# 가상환경 활성화
echo "🔌 가상환경 활성화 중..."
source mud_env/bin/activate

# pip 업그레이드
echo "⬆️ pip 업그레이드 중..."
pip install --upgrade pip

# 의존성 설치
echo "📦 의존성 설치 중..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 설치가 완료되었습니다!"
    echo ""
    echo "🎮 게임을 실행하려면:"
    echo "  source mud_env/bin/activate"
    echo "  python mud_game.py"
    echo ""
    echo "🧪 게임 로직 테스트를 원한다면:"
    echo "  python test_game.py"
    echo ""
    echo "📖 자세한 내용은 README.md를 참조하세요."
else
    echo "❌ 의존성 설치에 실패했습니다."
    echo "인터넷 연결을 확인하거나 수동으로 설치해주세요:"
    echo "  pip install textual rich"
    exit 1
fi