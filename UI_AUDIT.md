# UI Audit - Nextfarm SaaS Modernization

## Scope

Bước 1 chỉ audit UI/styling. Không thay đổi text/copy/label tiếng Việt, business logic, route, state, props, API call, cấu trúc dữ liệu hoặc folder/file hiện có.

Mục tiêu refactor về visual system kiểu modern SaaS: Linear, Vercel, Stripe Dashboard, Attio, nhưng giữ nguyên information architecture và toàn bộ nội dung hiện có.

## Tech / Styling Setup Hiện Tại

- Framework: Next.js App Router.
- Styling: Tailwind CSS v4 thông qua `@import 'tailwindcss';` trong `src/app/globals.css`.
- Không có `tailwind.config.*` trong repo hiện tại.
- PostCSS dùng `@tailwindcss/postcss`.
- Font đã dùng Inter qua `next/font/google` trong `src/app/layout.tsx`.
- Shared CSS variables hiện tại trong `src/app/globals.css`:
  - `--background: #f7f9f6`
  - `--foreground: #17211b`
  - `--muted: #66736b`
  - `--border: #dbe3dc`
  - `--surface: #ffffff`
  - `--primary: #236b4a`

## Files Chứa Styling Cần Refactor

### Shared / Shell Components

Các file này nên refactor trước vì ảnh hưởng toàn hệ thống:

- `src/app/globals.css`
  - Tokens nền, text, border, primary, font.
  - Hiện background là `#f7f9f6`, chưa đúng target `slate-50`.
- `src/components/layout/DashboardShell.tsx`
  - Sidebar, top bar, workspace switcher, notification dropdown, avatar, skeleton.
  - Active sidebar hiện dùng full green background (`bg-[#16a34a] text-white`), cần chuyển sang active state subtle.
- `src/components/layout/moduleNavigation.ts`
  - Không styling trực tiếp nhiều, nhưng là nguồn sidebar items/module order. Không đổi route/order/label.
- `src/components/layout/DataPage.tsx`
  - Shared table/simple page layout, đang dùng custom green/gray hex.
- `src/components/layout/GlobalModuleRail.tsx`
  - Có styling module rail cũ; cần kiểm tra còn được dùng ở flow nào không trước khi chỉnh.
- `src/components/ui/Button.tsx`
  - Shared Button hiện `rounded-md`, `bg-[#236b4a]`, hover `#1d5b3f`.
  - Cần chuyển về `rounded-lg`, emerald token, focus ring.

### IAM

- `src/components/iam/LoginPage.tsx`
- `src/components/iam/WorkspacePage.tsx`
- `src/components/iam/DashboardPage.tsx`
- `src/components/iam/UsersPage.tsx`
- `src/components/iam/GroupsPage.tsx`
- `src/components/iam/BranchesPage.tsx`
- `src/components/iam/SettingsPage.tsx`
- `src/components/iam/IamSubsystemSwitcher.tsx`

Ghi chú: IAM có nhiều modal/table/badge riêng, nên refactor sau shared shell để tránh lệch visual.

### Agriculture Modules

- `src/components/gis/GisPages.tsx`
- `src/components/process/SeasonPages.tsx`
- `src/components/harvest/HarvestPage.tsx`
- `src/components/iot/IotPages.tsx`
- `src/components/ai/AiPages.tsx`
- `src/components/marketplace/MarketplacePages.tsx`
- `src/components/report/ReportPages.tsx`
- `src/components/notification/NotificationPages.tsx`

Các module này hiện chứa phần lớn className page-level, nhiều helper component nội bộ như `Metric`, `FilterSelect`, `DataTable`, `StatusBadge`, `SelectField`, `MetricCard`.

## Mức Độ Styling Inline Theo File

Số lượng dòng className/styling cao nhất:

| File | Dòng styling ước tính | Nhận xét |
| --- | ---: | --- |
| `src/components/process/SeasonPages.tsx` | 516 | Nặng nhất, chứa tabs, modals, tables, form, KPI, timeline |
| `src/components/harvest/HarvestPage.tsx` | 245 | Header/tabs/list/detail/modal/QR |
| `src/components/gis/GisPages.tsx` | 207 | Map layout, filters, cards, modals |
| `src/components/marketplace/MarketplacePages.tsx` | 193 | Product cards, cart, checkout, order history |
| `src/components/iot/IotPages.tsx` | 172 | Dashboard cards, tables, charts, map |
| `src/components/ai/AiPages.tsx` | 157 | Tabs, cards, upload area, usage table |
| `src/components/report/ReportPages.tsx` | 140 | Report cards, tabs, detail, tables |
| `src/components/iam/UsersPage.tsx` | 137 | User table, toolbar, modal, pagination |
| `src/components/iam/GroupsPage.tsx` | 133 | Group list, permission matrix, modals |
| `src/components/iam/BranchesPage.tsx` | 109 | CRUD/table/modal |
| `src/components/iam/SettingsPage.tsx` | 109 | Settings cards/forms |
| `src/components/notification/NotificationPages.tsx` | 88 | Notification list/detail/settings |
| `src/components/layout/DashboardShell.tsx` | 65 | Global shell, high priority |

## Inconsistencies Hiện Tại

### Colors

- Có nhiều shade xanh khác nhau đang dùng song song:
  - `#16a34a`
  - `#236b4a`
  - `#2f7d32`
  - `#159447`
  - `#009688`
- Active navigation hiện dùng full green background ở nhiều nơi. Target yêu cầu active state subtle: `bg-emerald-50 + text-emerald-700 + border-l-2 border-emerald-600`.
- Background app không thống nhất:
  - `bg-white`
  - `bg-[#f8fafc]`
  - `bg-[#f8fbf7]`
  - `bg-[#f4f7fb]`
  - CSS variable `#f7f9f6`
- Border gray có nhiều hệ:
  - `#dbe3dc`
  - `#e1e4e8`
  - `#d8dce3`
  - `#e2e8f0`
  - `#cbd5e1`
- Text gray có nhiều hệ:
  - `#475569`
  - `#64748b`
  - `#66736b`
  - `#687084`
  - `#334155`

### Typography

- `font-extrabold`: khoảng 298 dòng.
- `font-bold`: khoảng 486 dòng.
- Target chỉ nên dùng weight 400/500/600 phần lớn hệ thống.
- Page titles nhiều nơi dùng `font-extrabold`, `text-[24px]`, `text-2xl`, `text-3xl` lẫn nhau.
- Section labels có nơi uppercase, có nơi normal, có nơi `font-extrabold`; cần chuẩn hóa về `text-xs font-medium uppercase tracking-wider`.

### Radius

- `rounded-md`: khoảng 304 dòng.
- `rounded-lg`: khoảng 232 dòng.
- `rounded-xl`: khoảng 146 dòng.
- `rounded-2xl`: khoảng 2 dòng.
- Target:
  - Inputs/buttons: `rounded-lg`
  - Cards: `rounded-xl`
  - Modals: `rounded-2xl`
  - Badges: `rounded-full` hoặc `rounded-md`

### Shadows

- `shadow-sm`: khoảng 120 dòng.
- `shadow-lg`: khoảng 13 dòng.
- `shadow-xl`: khoảng 13 dòng.
- Target: cards ưu tiên border hoặc `shadow-sm`; dropdown `shadow-md`; modals `shadow-xl`; bỏ `shadow-lg` khỏi cards thường.

### Layout / Spacing

- Container padding không thống nhất: `p-3`, `p-5`, `p-6`, `px-[20px]`, `py-[14px]`.
- Cards dùng nhiều mức padding: `p-3`, `p-4`, `p-5`, `p-6`.
- Filter bars ở GIS/Process/Harvest/IoT/Report/Marketplace không dùng cùng baseline label/input/gap.
- Buttons có height khác nhau: `h-8`, `h-9`, `h-10`, `h-11`.

### Tabs

- Các module có tabs riêng:
  - Process: `ProcessHeader`
  - Harvest: `HarvestHeader`
  - GIS: `GisHeader`
  - IoT: `IotShell`
  - AI: `AiShell`
  - Report: `ReportShell`
- Active tab hiện lẫn giữa bordered button, full green, outline green. Cần chọn một style nhất quán.
- Đề xuất dùng pill style: `bg-emerald-50 text-emerald-700`, inactive `text-slate-600 hover:bg-slate-100`.

### Tables

- Table header colors chưa thống nhất:
  - `bg-[#eef4ef]`
  - `bg-[#f1f5f9]`
  - `bg-[#f3f4f6]`
  - `bg-slate-50` chưa được dùng nhất quán.
- Cell padding có nơi `px-3 py-2`, nơi `px-4 py-3`.
- Row hover thiếu hoặc không nhất quán.

### Modals

- Modals nằm rải rác trong IAM, GIS, Process, Harvest.
- Backdrop chưa thống nhất, có nơi dùng overlay gray đậm nhưng chưa có `backdrop-blur-sm`.
- Radius/padding/header/action alignment chưa nhất quán.

### Badges / Status Pills

- Badge colors và spacing được định nghĩa cục bộ từng module.
- Có nhiều badge dùng custom hex thay vì semantic slate/emerald/amber/red/blue.
- Padding và font weight chưa thống nhất.

## Shared Components / Patterns Nên Chuẩn Hóa Trước

Không đổi props hoặc function signatures; chỉ chỉnh className/style.

1. `DashboardShell`
   - Sidebar active/hover.
   - Top bar border/background.
   - Workspace switcher hover.
   - Notification dropdown shadow/radius.
   - Avatar hover ring.
   - Skeleton neutral slate.

2. `Button`
   - Base primary button token.
   - `h-10`, `rounded-lg`, `font-medium`, transition, focus ring.

3. Global tokens in `globals.css`
   - App background, foreground, muted, border, surface, primary.
   - Tailwind v4 theme equivalent should be added via `@theme` or a config file if project chooses to introduce one.

4. Reusable internal patterns to refactor module-by-module
   - `FilterSelect` in GIS/Process/Harvest/IoT.
   - `Metric`, `MetricCard`, `StatCard`, `StatInline`.
   - `DataTable` / table wrappers.
   - `StatusBadge`, `ConfidenceBadge`, `ComplianceBadge`, invitation/user badges.
   - `ModalFrame` in IAM and modal variants in Process/Harvest/GIS.

## Đề Xuất Thứ Tự Refactor

### Phase 1 - Design Tokens

Files:
- `src/app/globals.css`
- Có thể thêm/refine theme equivalent cho Tailwind v4. Vì repo chưa có `tailwind.config.*`, nên lựa chọn ít xâm lấn nhất là thêm token CSS/Tailwind v4 `@theme` trong `globals.css`. Nếu bắt buộc dùng `tailwind.config.js`, cần tạo file mới và giữ compatibility với Tailwind v4.

Việc cần làm:
- Set app background `#F8FAFC`.
- Set text primary/secondary/muted/border/surface/brand tokens.
- Không thay đổi font setup hiện tại ngoài fallback nếu cần.

### Phase 2 - Global Shell

Files:
- `src/components/layout/DashboardShell.tsx`
- `src/components/ui/Button.tsx`
- `src/components/layout/DataPage.tsx`

Việc cần làm:
- Sidebar active state subtle.
- Topbar polish.
- Shared button consistent.
- Shared simple table consistent.

### Phase 3 - IAM Components

Files:
- `src/components/iam/DashboardPage.tsx`
- `src/components/iam/UsersPage.tsx`
- `src/components/iam/GroupsPage.tsx`
- `src/components/iam/BranchesPage.tsx`
- `src/components/iam/SettingsPage.tsx`
- `src/components/iam/LoginPage.tsx`
- `src/components/iam/WorkspacePage.tsx`

Ưu tiên:
- Dashboard KPI cards.
- User table/filter/modal.
- Group permission matrix/modal.
- Branch/settings forms.
- Auth/workspace screens sau cùng vì layout khác dashboard.

### Phase 4 - Agriculture Modules

Thứ tự đề xuất theo độ phức tạp và mức ảnh hưởng:

1. `src/components/process/SeasonPages.tsx`
   - Nặng nhất, nên làm sau khi shell/token đã ổn.
2. `src/components/gis/GisPages.tsx`
   - Map page cần giữ layout map/panel, chỉ refine filters/cards.
3. `src/components/harvest/HarvestPage.tsx`
   - Lists/details/modals.
4. `src/components/iot/IotPages.tsx`
   - Dashboard/chart/table.
5. `src/components/ai/AiPages.tsx`
   - AI cards/upload/results.
6. `src/components/marketplace/MarketplacePages.tsx`
   - Product cards/cart/checkout/order history.
7. `src/components/report/ReportPages.tsx`
   - Report cards/detail/table.
8. `src/components/notification/NotificationPages.tsx`
   - Notification center/settings/templates.

### Phase 5 - Consistency Pass

Screenshots/checklist:
- `/iam/`
- `/iam/users/`
- `/iam/groups/`
- `/gis/map/`
- `/process/tasks/`
- `/process/templates/`
- `/harvest/records/`
- `/iot/devices/`
- `/ai/assistant/`
- `/marketplace/`
- `/reports/`
- `/notifications/`

Check:
- Sidebar active state subtle across modules.
- Header does not shift.
- Page titles consistently `text-2xl font-semibold tracking-tight`.
- Cards use `rounded-xl border border-slate-200/60 bg-white p-6`.
- Tables use header `bg-slate-50 text-xs font-medium uppercase`.
- Buttons/inputs all `h-10 rounded-lg`.
- Vietnamese text remains unchanged and renders correctly.

## Risks / Notes

- `DashboardShell` still contains dark-mode branching. User yêu cầu không thêm feature mới; feature này đã tồn tại. Refactor chỉ được phép đổi visual class, không xóa/tạo logic.
- Some components combine rendering logic and styling in large files. Refactor must be narrow className-only.
- Marketplace currently uses localStorage for cart/orders; không được chạm vào logic này trong UI refactor.
- GIS map uses MapLibre CSS import; global token changes must not break map sizing.
- Tailwind v4 does not require `tailwind.config.*`; Step 2 should confirm whether to add `tailwind.config.js` or use `@theme` in `globals.css`.

## Recommendation Before Step 2

Chọn hướng token:

1. Preferred for current repo: add/refine Tailwind v4 `@theme` and CSS variables in `src/app/globals.css`.
2. Alternative: create `tailwind.config.js` only if the team wants explicit config file. This is a new config file, not an existing one.

Sau khi bạn confirm, bắt đầu Bước 2 với tokens trước, chưa refactor page-level.
