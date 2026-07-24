# 오세용재가복지센터 홈페이지 + 매일 사진 관리자

## 주요 기능
- `/admin/`에서 휴대폰으로 프로그램 사진과 글 등록
- GitHub에 자동 저장
- Vercel 자동 업데이트
- 네이버 SEO 기본 설정
- 센터 내부 사진, 프로그램 사진, 자체 조리 식사, 전화상담

## GitHub 업로드
ZIP을 푼 뒤 안의 파일과 폴더를 모두 기존 GitHub 저장소 최상위에 업로드하세요.
기존 index.html, style.css, script.js는 새 파일로 덮어씁니다.

## GitHub OAuth 최초 설정
1. GitHub 프로필 → Settings
2. Developer settings → OAuth Apps → New OAuth App
3. Application name: 오세용 홈페이지 관리자
4. Homepage URL: https://ohseyong.vercel.app
5. Authorization callback URL: https://ohseyong.vercel.app/api/callback
6. 발급된 Client ID와 Client secret을 복사

## Vercel 환경변수
Vercel 프로젝트 → Settings → Environment Variables:
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

두 값을 등록하고 Redeploy 하세요.

## 매일 사진 올리기
https://ohseyong.vercel.app/admin/
→ Login with GitHub
→ 홈페이지 관리
→ 프로그램 활동 사진
→ 새 항목 추가
→ 날짜, 제목, 설명, 사진 등록
→ Publish

## 센터 고정 사진 교체
GitHub의 uploads 폴더에서 아래 파일을 같은 이름으로 교체:
- center-main.jpg
- center-01.jpg
- center-02.jpg
- center-03.jpg
- meal-main.jpg

## 네이버 서치어드바이저
- 사이트: https://ohseyong.vercel.app
- 사이트맵: https://ohseyong.vercel.app/sitemap.xml
- robots: https://ohseyong.vercel.app/robots.txt

어르신 얼굴이 보이는 사진은 홈페이지 공개 동의를 받은 사진만 사용하세요.
