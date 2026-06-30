# TODO

## 콘텐츠 전략 (최우선 — 근거: `.claude/docs/blog-consulting.md`)

> 기능보다 우선. 콘텐츠가 블로그의 90%.

- [ ] **About + 태그라인 재작성** — 정체성 확정, "카카오게임즈 데이터" 전면에 (`_config.yml` tagline/description, `about.md`)
- [ ] **arXiv ID 제목 정리** — `2410.09342` 류 → 사람이 읽는 제목으로 + "GPT 30분" 디스클레이머 톤 수정
- [ ] **카테고리 5개 → 3개 통합** — Data Engineering / Paper & ML / Career & Notes (`_data/category_labels.yml` + 각 포스트 front matter)
- [ ] **홈 대표글(Start Here) 섹션** — 베스트 3~4개 고정 (면접 글, Parquet, 회고)
- [ ] **드래프트 청소** — 안 끝낼 글 매장 (RealMySQL, Airflow, data-something)
- [ ] **논문 리뷰에 "내 도메인 쓸모" 관점 추가** — 게임 데이터 실무자 시점 한 줄

---

## 브랜치 / 배포 정리

- [x] `gh-pages` → `main` 브랜치 rename
- [x] `master` 브랜치 삭제
- [x] GitHub Actions 배포 워크플로우 추가 (`.github/workflows/deploy.yml`)
- [x] `Gemfile` 추가 (jekyll 4.3, jekyll-paginate)
- [x] `CLAUDE.md` 추가
- [x] Actions 첫 실행 결과 확인 및 GitHub Pages 소스 설정 확인

---

## 기능 개선

### 완료
- [x] **페이지네이션 복구** — 홈 화면 포스트 목록 + 페이지 이동 복원
- [x] **OG 메타 태그** — LinkedIn/Twitter 공유 시 미리보기 카드
- [x] **이전/다음 포스트 네비게이션** — 포스트 하단 이전글/다음글 링크
- [x] **독서 시간 표시** — 포스트 제목 하단에 예상 읽기 시간
- [x] **댓글 기능 (Giscus)** — GitHub Discussions 기반 댓글
- [x] **코드 블록 복사 버튼** — 코드 블록 우상단 복사 버튼
- [x] **GA ID 하드코딩 수정** — `_config.yml` 변수 참조로 변경

### 다음 우선순위
- [ ] 다크 모드 (`prefers-color-scheme` CSS)
- [ ] TOC (Table of Contents) — 긴 논문 리뷰 글용
- [ ] 검색 기능 (Lunr.js, client-side)
- [ ] 관련 포스트 (Related Posts) — 같은 카테고리 최근 글 2~3개
- [ ] 소셜 공유 버튼 (LinkedIn, Twitter)
- [ ] FontAwesome self-hosting (현재 CDN 4.6.3 구버전)

---

## 버그 / 마이너 수정

- [ ] `strong { font-weight: 400 }` 확인 — 베이스가 200이라 의도적일 수 있음. 직접 확인 필요
- [ ] 이미지 lazy loading (`loading="lazy"`)
- [ ] 이미지 WebP 변환 — 현재 PNG 그대로, 용량 큰 것들 있음

---

## 블로그 운영 (콘텐츠 / SEO)

- [ ] **드래프트 정리** — `_draft/`에 RealMySQL, Airflow 등 미완성 글, 완성할 것/버릴 것 분류
- [ ] **About 페이지 보강** — 현재 연락처 나열 수준, 경력·블로그 방향성 추가
- [ ] **논문 시리즈화** — Attention 계열, MoE 계열 등 주제별로 묶어 시리즈 페이지 구성
- [ ] **글쓰기 주기 공표** — Weekly Paper 형식이나 업로드 주기 불규칙, 격주라도 고정
- [ ] **Lighthouse 점수 측정** — 성능/접근성 기준선 확인 후 개선 방향 설정
- [ ] **Google Fonts self-hosting** — Noto Sans KR 외부 CDN → 직접 호스팅 (성능·개인정보)
