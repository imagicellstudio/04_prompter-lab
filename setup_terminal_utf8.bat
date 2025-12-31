@echo off
REM Command Prompt에서 UTF-8 설정 스크립트

REM 코드페이지를 UTF-8(65001)로 설정
chcp 65001 >nul

echo ================================================
echo 터미널 UTF-8 설정 완료
echo ================================================

echo.
echo 현재 코드페이지:
chcp

echo.
echo 한글 테스트: 안녕하세요! 한글이 잘 보이나요?
echo Korean Test: 가나다라마바사아자차카타파하

echo.
echo === 영구 적용하기 ===
echo Windows 레지스트리에 UTF-8을 기본값으로 설정:
echo 1. 시스템 제어판 ^> 지역 ^> 관리자 옵션
echo 2. "시스템 로캘 변경" 클릭
echo 3. "Beta: 세계 언어 지원을 위해 UTF-8 사용" 체크
echo 4. 재부팅
echo.
echo 또는 CMD 시작 시 자동 실행:
echo 1. 레지스트리 편집기 실행 (regedit)
echo 2. HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Command Processor
echo 3. 새 문자열 값: AutoRun
echo 4. 값: chcp 65001 ^>nul

pause
