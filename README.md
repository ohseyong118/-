# 오세용재가복지센터 Firebase 관리자 버전

GitHub OAuth 없이 Google 로그인으로 사진을 올리는 버전입니다.

## 작동 방식

- 홈페이지 방문자는 Firestore에서 프로그램 글을 읽습니다.
- 관리자는 `/admin/`에서 Google 로그인합니다.
- 사진은 Firebase Storage에 저장됩니다.
- 글 내용과 사진 주소는 Firestore에 저장됩니다.
- Vercel 재배포 없이 즉시 홈페이지에 반영됩니다.

## 1. GitHub 업로드

압축을 푼 후 안의 모든 파일과 폴더를 기존 GitHub 저장소 최상위에 업로드하세요.

기존 파일은 같은 이름으로 덮어쓰면 됩니다.

## 2. Firebase 프로젝트 만들기

Firebase Console에서 새 프로젝트를 만듭니다.

프로젝트 이름 예시:
`ohseyong-center`

Google Analytics는 선택사항입니다.

## 3. 웹 앱 등록

프로젝트 개요 → 웹 앱 아이콘 `</>` → 앱 등록

앱 별칭:
`오세용 홈페이지`

등록 후 나타나는 `firebaseConfig` 값을 복사합니다.

GitHub의:
`assets/firebase-config.js`

파일을 열고 해당 값을 넣습니다.

같은 파일의:
`ADMIN_EMAIL`

에는 관리자 로그인에 사용할 실제 Gmail 주소를 넣습니다.

## 4. Google 로그인 켜기

Firebase Console:
Authentication → 시작하기 → Sign-in method → Google → 사용 설정 → 저장

Authentication → Settings → Authorized domains에서 아래 도메인이 허용됐는지 확인:
- `ohseyong.vercel.app`
- `localhost`

## 5. Firestore 만들기

Build → Firestore Database → Create database

운영 모드로 시작하고, 위치는 가까운 아시아 리전을 선택하세요.

`firestore.rules` 파일 내용을 Firebase Console의 Firestore → Rules에 붙여넣습니다.

중요:
`여기에_관리자_GMAIL@gmail.com`을 실제 Gmail로 바꾸세요.

Publish를 누릅니다.

## 6. Storage 만들기

Build → Storage → Get started

`storage.rules` 파일 내용을 Storage → Rules에 붙여넣습니다.

중요:
여기도 관리자 Gmail 주소를 실제 주소로 바꾸세요.

Publish를 누릅니다.

## 7. GitHub 재업로드

`assets/firebase-config.js`, `firestore.rules`, `storage.rules`의 Gmail과 Firebase 설정을 수정한 뒤 GitHub에 다시 올립니다.

Vercel이 자동 배포합니다.

## 8. 관리자 접속

https://ohseyong.vercel.app/admin/

Google 로그인 → 사진과 글 작성 → 게시

게시하면 Vercel 재배포 없이 홈페이지에 즉시 나타납니다.

## 9. 센터 고정 사진

`uploads` 폴더의 아래 파일은 GitHub에서 교체합니다.

- center-main.jpg
- center-01.jpg
- center-02.jpg
- center-03.jpg
- meal-main.jpg

## 개인정보

어르신 얼굴이 식별되는 사진은 홈페이지 공개 동의를 받은 경우에만 올리세요.

## 이번에 반영된 센터 사진

- `center-main.jpg`: 센터 내부 전체 전경
- `center-01.jpg`: 넓은 생활실 및 휴식 공간
- `center-02.jpg`: 어르신 작품 전시 게시판
- `center-03.jpg`: 센터 내부 활동 공간

사진은 웹 로딩 속도를 위해 자동으로 크기와 용량을 최적화했습니다.
