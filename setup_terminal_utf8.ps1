# PowerShell에서 UTF-8 설정 스크립트

# 콘솔 코드페이지를 UTF-8(65001)로 설정
chcp 65001

# PowerShell 출력 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=" -NoNewline
Write-Host ("=" * 49)
Write-Host "터미널 UTF-8 설정 완료"
Write-Host "=" -NoNewline
Write-Host ("=" * 49)

# 현재 설정 확인
Write-Host "`n현재 설정:"
Write-Host "Console Output Encoding: $([Console]::OutputEncoding.EncodingName)"
Write-Host "PowerShell Output Encoding: $($OutputEncoding.EncodingName)"

# 한글 테스트
Write-Host "`n한글 테스트: 안녕하세요! 한글이 잘 보이나요?"
Write-Host "Korean Test: 가나다라마바사아자차카타파하"

# 이 설정을 PowerShell 프로파일에 추가하는 방법 안내
Write-Host "`n=== PowerShell 프로파일에 영구 적용하기 ==="
Write-Host "1. PowerShell 프로파일 열기:"
Write-Host "   notepad `$PROFILE"
Write-Host "`n2. 다음 내용 추가:"
Write-Host "   chcp 65001 > `$null"
Write-Host "   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8"
Write-Host "   `$OutputEncoding = [System.Text.Encoding]::UTF8"
Write-Host "`n3. PowerShell 재시작"
