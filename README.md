# 오세용재가복지센터 휴대폰 사진 관리자

## 사용
- 관리자 주소: https://ohseyong.vercel.app/admin/
- 휴대폰에서 Google 로그인
- 제목, 설명, 사진 최대 8장 선택
- 게시하기
- 1~3분 후 홈페이지 반영

## GitHub 설정
Fine-grained Personal Access Token을 발급합니다.

Repository access:
- Only select repositories
- 저장소: ohseyong118 / -

Repository permissions:
- Contents: Read and write
- Metadata: Read-only

## Vercel 환경변수
프로젝트 → Settings → Environment Variables

- GITHUB_TOKEN = 발급한 Fine-grained token
- ADMIN_EMAIL = dhtpdyd0118@gmail.com

Production / Preview / Development 모두 적용 후 Redeploy

## 주의
- GitHub 토큰을 소스코드에 직접 넣지 마세요.
- 관리자 Gmail 외 계정은 업로드할 수 없습니다.
- 사진은 브라우저에서 자동 압축 후 업로드됩니다.
