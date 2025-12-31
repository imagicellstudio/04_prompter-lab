# -*- coding: utf-8 -*-
"""
UTF-8 한글 처리 설정 예제
"""
import sys
import os
import io

# Python 3.7 이상에서는 기본적으로 UTF-8을 사용하지만, 명시적 설정
if sys.version_info >= (3, 7):
    # Python 3.7+ 에서는 기본 UTF-8
    print(f"Python version: {sys.version}")
    print(f"Default encoding: {sys.getdefaultencoding()}")
    print(f"File system encoding: {sys.getfilesystemencoding()}")

# 표준 출력을 UTF-8로 강제 설정 (Windows에서 필요할 수 있음)
if sys.platform.startswith('win'):
    # Windows에서 콘솔 출력 UTF-8 설정
    if sys.stdout.encoding != 'utf-8':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def test_korean():
    """한글 출력 테스트"""
    print("=" * 50)
    print("한글 UTF-8 인코딩 테스트")
    print("=" * 50)

    # 한글 문자열
    korean_text = "안녕하세요! 한글이 잘 보이나요?"
    print(f"한글 텍스트: {korean_text}")

    # 파일 읽기/쓰기 예제
    test_file = "test_korean.txt"

    # UTF-8로 파일 쓰기
    with open(test_file, 'w', encoding='utf-8') as f:
        f.write("한글 파일 쓰기 테스트\n")
        f.write("UTF-8 인코딩으로 저장됩니다.\n")

    # UTF-8로 파일 읽기
    with open(test_file, 'r', encoding='utf-8') as f:
        content = f.read()
        print(f"\n파일 내용:\n{content}")

    # 정리
    os.remove(test_file)
    print("테스트 완료!")

if __name__ == "__main__":
    test_korean()
