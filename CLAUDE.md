# CLAUDE.md — jaybe-park.github.io

## 프로젝트 개요

Jaybe Park (박종범)의 개인 개발 블로그.  
Jekyll + [Lanyon](https://lanyon.getpoole.com/) 테마 (Poole 기반), GitHub Pages로 배포.  
주요 콘텐츠: LLM/ML 논문 리뷰 (Weekly/Daily Paper), 데이터 엔지니어링 문서.

---

## 브랜치 전략

| 브랜치 | 역할 | 직접 커밋 |
|--------|------|-----------|
| `main` | Jekyll 소스 코드 — 모든 작업의 기준 | O |
| `gh-pages` | GitHub Actions가 빌드한 결과물(`_site/`) | X — 자동 생성 |

- `main`에 push하면 `.github/workflows/deploy.yml`이 트리거됨
- Actions가 Jekyll 빌드 후 `gh-pages` 브랜치에 결과물을 자동 배포
- `gh-pages`는 절대 직접 수정하지 않음

---

## 디렉토리 구조

```
_posts/          # 게시된 포스트 (YYYY-MM-DD-slug.md)
_draft/          # 작성 중인 포스트 (빌드 미포함)
_layouts/        # default.html, post.html, page.html
_includes/       # head.html, sidebar.html
_data/           # category_labels.yml
assets/          # 포스트 이미지
public/css/      # poole.css (기본), lanyon.css (테마), jaybe.css (커스텀), syntax.css
public/js/       # script.js, contents-filter.js (카테고리 필터)
contents/        # 목록 페이지 (index.html, categories.html, tags.html)
```

---

## 포스트 작성 가이드

### 파일명 규칙
```
_posts/YYYY-MM-DD-slug.md
```

### Front Matter

```yaml
---
layout: post
title: "포스트 제목"
category: paper          # paper | docs | essay | data-engineering | python-advanced
tag: 태그명              # 선택사항, 복수 시 [tag1, tag2]
description: "한 줄 설명"  # 선택사항, 목록 페이지에 노출
---
```

### 카테고리 목록 (`_data/category_labels.yml`)

| slug | 표시명 |
|------|--------|
| `paper` | Paper |
| `docs` | Docs |
| `essay` | Essay |
| `data-engineering` | Data Engineering |
| `python-advanced` | Python Advanced |

### 이미지 경로
```markdown
![설명]({{ site.baseurl }}/assets/YYYY-MM-DD-이미지명.png)
```
이미지 파일은 `/assets/` 에 위치.

---

## 로컬 개발

```bash
# 의존성 설치 (최초 1회)
bundle install

# 로컬 서버 실행 (http://localhost:4000)
bundle exec jekyll serve

# draft 포함해서 확인
bundle exec jekyll serve --drafts
```

---

## 배포

`main` 브랜치에 push하면 자동 배포됨. 수동 트리거가 필요하면 GitHub Actions 탭에서 `workflow_dispatch` 사용.

---

## 테마 커스터마이징

- 색상 테마: `_layouts/default.html`의 `<body class="theme-base-08">` — `theme-base-08`이 레드 계열
- 커스텀 CSS 추가: `public/css/jaybe.css` 에만 작성 (lanyon.css/poole.css 는 테마 원본)
- 사이드바 메뉴: `_config.yml`의 `nav` 섹션에서 수정
