#!/usr/bin/env node

/**
 * Claude Code 프롬프트 자동 로깅 스크립트
 *
 * 사용법: user-prompt-submit-hook에 등록
 * 환경변수:
 *   - CLAUDE_USER_PROMPT: 사용자가 입력한 프롬프트
 *   - CLAUDE_CWD: 현재 작업 디렉토리
 */

const fs = require('fs');
const path = require('path');

// 설정
const CONFIG = {
  logDir: 'research-logs',
  timezone: 'Asia/Seoul',
  encoding: 'utf-8'
};

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 현재 시간을 HH:MM:SS 형식으로 반환
 */
function getTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 프롬프트를 로그 파일에 기록
 */
function logPrompt(prompt, workingDir) {
  try {
    // 로그 디렉토리 경로
    const logDirPath = path.join(workingDir, CONFIG.logDir);

    // 디렉토리가 없으면 생성
    if (!fs.existsSync(logDirPath)) {
      fs.mkdirSync(logDirPath, { recursive: true });
    }

    // 오늘 날짜의 로그 파일명
    const today = getToday();
    const logFileName = `${today}.md`;
    const logFilePath = path.join(logDirPath, logFileName);

    // 파일이 없으면 헤더 생성
    if (!fs.existsSync(logFilePath)) {
      const header = `# Claude Code 연구 로그 - ${today}\n\n`;
      fs.writeFileSync(logFilePath, header, CONFIG.encoding);
    }

    // 로그 엔트리 작성
    const timestamp = getTime();
    const logEntry = `## [${timestamp}]\n\n${prompt}\n\n---\n\n`;

    // 파일에 추가
    fs.appendFileSync(logFilePath, logEntry, CONFIG.encoding);

    // 성공 메시지는 stderr로 출력 (사용자에게 방해되지 않도록)
    console.error(`✓ 프롬프트 기록됨: ${logFileName}`);

  } catch (error) {
    // 에러 발생 시에도 사용자 작업을 방해하지 않음
    console.error(`⚠ 로그 기록 실패: ${error.message}`);
  }
}

// 메인 실행
function main() {
  const prompt = process.env.CLAUDE_USER_PROMPT;
  const workingDir = process.env.CLAUDE_CWD || process.cwd();

  if (!prompt) {
    console.error('⚠ CLAUDE_USER_PROMPT 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  logPrompt(prompt, workingDir);
}

main();
