# PROJECT_CUSTOMIZATIONS.md

Parent index: `docs/README.md`.

This file records project-level customizations that differ from upstream `new-api`, especially the UI/entry flow changes made for this repository.

## Documentation Scope

This document is the source of truth for local public-page, entry-flow, footer, legal-page,
login/register, model-plaza, branding, and enterprise-owner token customizations.

The existing enterprise documents in `docs/enterprise-*.md` remain useful for enterprise data
model, API, account, member, quota, and audit behavior. If an enterprise document describes an
older entry/layout behavior that differs from this file, prefer this file for frontend routing and
public-page behavior.

## 1. Current Frontend Entry Strategy

- The primary public entry is the default frontend.
- The old homepage style is reused as the main landing page.
- Public entry and authenticated entry are separate: public visitors land on `/`, while signed-in
  console redirects can still default to `/enterprise`.
- Public pages such as:
  - `/`
  - `/about`
  - `/user-agreement`
  - `/privacy-policy`
  use the customized public layout instead of redirecting into the console.

## 2. Homepage Behavior

- The homepage route uses the legacy-style landing page implementation.
- The homepage hero content is now configurable from admin settings through `HomePageContent`.
- `HomePageContent` supports:
  - plain text line mapping for quick title/subtitle overrides
  - JSON for richer hero configuration

Supported JSON fields include:

- `titleTop`
- `titleBottom`
- `subtitle`
- `serverAddress`
- `endpoints`
- `primaryButtonText`
- `primaryButtonUrl`
- `secondaryButtonText`
- `secondaryButtonUrl`
- `providersTitle`

## 3. Public Content Pages

A shared public content page template is used for public document-like pages:

- `about`
- `user-agreement`
- `privacy-policy`

Shared behavior:

- same public top navigation
- same footer
- same responsive content container
- supports URL / HTML / Markdown rendering

Main shared component:

- `web/default/src/components/layout/components/public-content-page.tsx`

## 4. About / Privacy / User Agreement Admin Connectivity

These pages are connected to admin-configured content:

- About page uses admin `About`
- User agreement uses admin `legal.user_agreement`
- Privacy policy uses admin `legal.privacy_policy`

Rendering rules:

- URL -> iframe embed
- HTML -> render HTML body/content
- Markdown/plain text -> markdown rendering

## 5. Footer Customization Rules

Footer behavior has been customized from upstream:

- Admin `Footer` content only affects the bottom copyright text area
- It no longer replaces the whole footer block
- If custom footer content is provided:
  - only the configured custom footer text is shown in the bottom row
  - default project attribution line is hidden

Recommended admin footer HTML:

```html
<span>&copy; 2026 Your Brand. All rights reserved.</span>
```

For stability, prefer:

- `span`

Avoid block-heavy markup like:

- `p`
- `div`

unless layout behavior is explicitly desired.

## 6. Footer Link Area

The upper footer link area has been simplified:

- only `User Agreement`
- and `Privacy Policy`

should remain in the right-side public footer link section.

This area was also adjusted for:

- slightly larger text
- better vertical spacing
- more centered single-column alignment

## 7. Login / Register / Public Header Styling

The sign-in and sign-up pages were redesigned to match the public homepage top menu style:

- consistent logo + title block
- same public navigation style
- black/white login/register buttons
- enlarged auth card and typography

The classic pricing/model plaza header was also aligned visually with this public header style.

## 8. Model Plaza

- Model plaza continues to reuse the classic-style pricing/model interface.
- Its header styling has been aligned with the current public site styling.

## 9. Enterprise Owner API Key Logic

Enterprise owner account API-key behavior was customized:

- enterprise owner company-billed API keys are separated from member read-only display
- owner API keys should support owner-side operations
- enterprise member keys remain read-only where appropriate

Related backend/frontend work includes:

- owner token route support
- enterprise owner token display fixes

## 10. Super Admin Sidebar Exception

For the super admin account only:

- the sidebar `Service` group is hidden
- this removes the `Enterprise` and `Personal` dropdowns for that account

Other users keep normal sidebar behavior.

## 11. Browser Title / Branding Initialization

To reduce the initial flash of `New API` before custom branding loads:

- `web/default/index.html` now applies cached system title as early as possible
- frontend branding is then refreshed again after app startup

This improves but does not fully eliminate first-visit title fallback when no cache exists yet.

## 12. Recommended Files To Review Before Further UI Changes

If continuing UI or public-site work, check these files first:

- `web/default/src/features/legacy-home/index.tsx`
- `web/default/src/components/layout/components/public-content-page.tsx`
- `web/default/src/components/layout/components/footer.tsx`
- `web/default/src/features/auth/auth-layout.tsx`
- `web/default/src/features/classic-pricing/index.tsx`
- `web/default/src/features/system-settings/general/system-info-section.tsx`

## 13. Recent Customization-Oriented Commits

Recent related commits include:

- `4b1df304` `主页开发`
- `b51f8198` `美化模型广场页面`
- `3a2bc611` `优化登录和模型广场样式`
- `58794e36` `fix enterprise owner api display`
- `15a272b2` `优化主页页脚布局`
- `48572ad5` `公共内容页模板`
- `8685548b` `新增企业主令牌接口`
- `c2bdc87b` `统一公开页与登录入口样式`
- `a73fdb4a` `同步首页与企业页面文案`
- `1578d64a` `修正页脚自定义显示逻辑`

When merging upstream changes, review these areas carefully to avoid losing local behavior.
