# English Lesson Studio — Code និង UI/UX Audit Report

**ស្ថានភាពពិនិត្យ៖** Prototype/MVP ដែលដំណើរការដោយ static HTML, CSS និង Vanilla JavaScript។ ខ្ញុំបានអាន `index.html`, `style.css`, `script.js`, `README.md`, សាកល្បង workflow សំខាន់ៗក្នុង browser និងពិនិត្យ JavaScript syntax ដោយ `node --check`។ លទ្ធផល៖ syntax របស់ `script.js` ត្រឹមត្រូវ ហើយមិនឃើញ console error នៅក្នុង initial workflow ដែលបានសាកល្បង។ របាយការណ៍នេះគឺជា **review phase ប៉ុណ្ណោះ**; មិនទាន់កែ source code ទេ ដើម្បីរក្សា feature និង workflow ដើមតាមការណែនាំរបស់អ្នក។

## 1. សេចក្ដីសង្ខេបសម្រាប់សម្រេចចិត្ត

Project នេះមានមូលដ្ឋានល្អសម្រាប់ lesson-animation editor តូចមួយ៖ structure ងាយយល់, dependency តិច, UI មាន direction ច្បាស់ និងប្រើ `textContent` សម្រាប់បង្ហាញ user text ដែលជាជម្រើសល្អជាងការបញ្ចូល HTML ដោយផ្ទាល់។ Core flow—បញ្ចូល sentence → បំបែកជា words → ជ្រើស word → បញ្ចូល Khmer meaning/image → preview—ដំណើរការបាន។

បញ្ហាសំខាន់បំផុតមិនមែន syntax error ទេ ប៉ុន្តែជា **state និង persistence**៖ Save file មិនរក្សាទុករូបភាព, background image ឬ audio ទេ; Export MP4 នៅជាប៊ូតុង placeholder; playback មិនអាច Stop/Cancel បាន និងអាចមាន timer ចាស់បន្តដំណើរការ ប្រសិនបើ state ត្រូវបានប្តូរ។ លើសពីនេះ responsive CSS ប្តូរ workspace ទៅជាជួរឈរតែមួយ ប៉ុន្តែមិនទាន់រៀបចំ mobile navigation/panel hierarchy ឲ្យល្អសម្រាប់អេក្រង់តូច។

## 2. Critical Problems

| បញ្ហា | មូលហេតុ | ដំណោះស្រាយដែលណែនាំ | សារៈសំខាន់ |
|---|---|---|---|
| **Save lesson បាត់ media** | `script.js:451–476` save តែ `hasImage`; មិនរក្សា `imageData`, background image និង audio data។ User អាចយល់ថា lesson បាន save ពេញលេញ ប៉ុន្តែពេលយកទៅប្រើវិញ media បាត់។ | បង្កើត lesson schema versioned។ Phase ដំបូងអាចប្រើ IndexedDB សម្រាប់ blobs និង JSON រក្សា references; បន្ថែម Import lesson ដើម្បី restore បានពេញលេញ។ | **Critical** |
| **Export MP4 មិនដំណើរការ** | `script.js:488–491` មានតែ status message ហើយ README ក៏បញ្ជាក់ថាជា placeholder។ ប៊ូតុងមានរូបរាងដូច feature រួចរាល់។ | ប្តូរ label ទៅ `Export (coming soon)` រហូតដល់ implement ឬធ្វើ MediaRecorder/WebM ជា phase ដាច់ដោយឡែក ហើយបង្ហាញ progress/error state។ | **Critical / Product clarity** |
| **Playback គ្មាន Stop និង cancellation** | `playPreview()` ប្រើ recursive `setTimeout` នៅ `script.js:305–339` ប៉ុន្តែមិនរក្សាទុក timer id និងមិនមាន cleanup function។ បើអ្នកកែ sentence ឬចង់បញ្ឈប់ពាក់កណ្តាល វាមិនអាចបញ្ឈប់បានត្រឹមត្រូវ។ | រក្សាទុក `playbackTimer`, បង្កើត `stopPreview()` និងប្រើ button state `Play / Pause / Replay` ឲ្យច្បាស់។ នៅពេល break sentence ឬប្តូរ layout ត្រូវ cancel timer ចាស់។ | **High** |
| **ការកែ sentence បង្កើត state ថ្មីដោយបាត់ data ចាស់** | `breakBtn` map tokens ទៅ array ថ្មីទាំងស្រុងនៅ `script.js:81–103`។ វាជា behavior ដែលអាចបាត់ Khmer meanings/images ដោយគ្មាន confirmation។ | បង្ហាញ confirmation ប្រសិនបើមាន unsaved edits ឬព្យាយាម preserve data តាម token/id នៅពេល break ម្តងទៀត។ | **High** |
| **Audio និង background image មិននៅក្នុង lesson model** | Audio ត្រូវបានដាក់ផ្ទាល់លើ `<audio>` និង background image ដាក់លើ CSS custom property ប៉ុណ្ណោះ (`script.js:354–376`, `417–442`)។ | ដាក់ settings ទាំងនេះក្នុង centralized `state` ហើយ serialize តាម IndexedDB/reference។ | **High** |
| **HTML accessibility មិនពេញលេញ** | `index.html` ប្រើ `<div>` ជា word card និង image upload area ជា clickable div (`index.html:184–191`)។ មិនមាន `aria-label`, focus style, keyboard activation និង error feedback គ្រប់គ្រាន់។ | ប្រើ `<button>` សម្រាប់ word cards ឬបន្ថែម keyboard handlers/ARIA; បន្ថែម visible focus, label association និង status announcements។ | **High** |
| **User text ត្រូវបានបញ្ចូលទៅ attribute ក្នុង template string** | `updateImage()` ប្រើ ``<img src="${w.imageData}" alt="${w.text}">`` នៅ `script.js:295–301`។ `src` គឺ FileReader data URL ប៉ុន្តែ `alt` មិនបាន escape ប្រសិនបើបង្កើត HTML។ | ប្រើ `document.createElement('img')`, កំណត់ `src` និង `alt` ដោយ property ដើម្បីជៀសវាង HTML injection និងរក្សា DOM behavior ឲ្យមានសុវត្ថិភាព។ | **Medium–High** |

## 3. Improvements និង logic ដែលគួររៀបចំ

| តំបន់ | ការសង្កេត | អ្វីគួរកែ |
|---|---|---|
| State management | `words`, `selectedWordId`, `layoutMode`, `stepMs` ជា global mutable variables ហើយ settings ផ្សេងៗនៅក្នុង DOM។ | បង្កើត object តែមួយដូចជា `state = { words, selectedWordId, settings, media, playback }` និង render/update functions ដែលមានទិសដៅច្បាស់។ មិនចាំបាច់ប្តូរ framework ទេ។ |
| Re-rendering | រាល់ Khmer input កំពុងហៅ `renderWordCards()` និងបង្កើត DOM card/listener ថ្មីទាំងអស់ (`script.js:211–216`)។ | ប្រើ event delegation លើ `wordCardsEl` ឬ update តែ card ដែលកំពុងកែ។ នេះក៏ធ្វើឲ្យ input typing មានភាពរលូនជាងមុន។ |
| ID generation | `uid()` ប្រើ `Math.random()` (`script.js:72–74`)។ សម្រាប់ local prototype គ្រប់គ្រាន់ ប៉ុន្តែមិនមែន collision-proof ទេ។ | ប្រើ `crypto.randomUUID()` ប្រសិនបើ browser support; fallback ទៅ generator បច្ចុប្បន្ន។ |
| Validation | File upload មិនកំណត់ size/type ជាក់ស្តែង ហើយមិនមាន error state បើ FileReader បរាជ័យ។ | កំណត់ file size, MIME type, បង្ហាញ error message និង revoke object URLs ប្រសិនបើប្តូរទៅ `URL.createObjectURL`។ |
| Save UX | Save download បាន ប៉ុន្តែមិនមាន `dirty` state, last saved time, Import ឬ overwrite warning។ | បន្ថែម `Unsaved changes`, `Save lesson`, `Import lesson` និង confirmation មុន replace state។ |
| Timeline | Word order បង្ហាញបាន ប៉ុន្តែមិន clickable/reorderable ទោះ README បញ្ជាក់ថា drag-to-reorder មិនទាន់ built។ | Phase ក្រោយបន្ថែម keyboard-friendly reorder; កុំបន្ថែម drag-and-drop មុនពេល core persistence រួច។ |
| Error handling | `audioPlayer.play().catch(() => {})` លាក់ error ទាំងស្រុង (`script.js:287–290`)។ | បង្ហាញ status ប្រសិនបើ audio មិនអាច play បាន ហើយមិនបំផ្លាញ preview ទេ។ |

## 4. UI/UX Review

### អ្វីដែលល្អ

- **Visual identity ច្បាស់**៖ indigo + gold + warm paper មានភាពខុសគ្នា និងសមនឹង educational creative tool។
- **Three-column mental model ល្អ**៖ Build នៅឆ្វេង, Stage នៅកណ្ដាល, Word detail នៅស្តាំ ធ្វើឲ្យ workflow ងាយយល់លើ desktop។
- **Settings ត្រូវបានបែងចែកជា accordion**៖ background, text style, word box, image, audio និង animation មិនធ្វើឲ្យ panel វែងពេកនៅពេលបិទ។
- **Preview មាន aspect ratio សមស្របសម្រាប់ social platforms**៖ 16:9, 9:16 និង 1:1 ជា choice ដែល user យល់បានភ្លាម។
- **Khmer typography ត្រូវបានគិតគូរ**៖ មាន Kantumruy Pro និង input class សម្រាប់ Khmer ដែលល្អសម្រាប់អ្នកប្រើក្នុងស្រុក។

### អ្វីដែលមើលទៅចាស់ ឬពិបាកប្រើ

| បញ្ហា UI/UX | ផលប៉ះពាល់ | Design direction |
|---|---|---|
| Top bar និង side panels មាន contrast ខ្លាំង ប៉ុន្តែ hierarchy រវាង primary និង secondary action មិនទាន់ច្បាស់ | User មិនប្រាកដថា Save និង Export មួយណាជា safe action និងមួយណាជា unavailable feature | រក្សា gold សម្រាប់ primary action តែបន្ថែម disabled/coming-soon state សម្រាប់ Export; បន្ថែម icon + tooltip តិចតួច |
| Labels ជាច្រើនប្រើ uppercase 11px និង opacity ទាប | Khmer/English text អាចអានលំបាក ជាពិសេសលើ screen តូច | Labels គួរមាន contrast ខ្ពស់ជាងមុន និងប្រើ sentence case សម្រាប់ user-facing Khmer text |
| Word cards ជា `<div>` ដែលមិនបង្ហាញថាអាចចុចបានច្បាស់ | Discoverability ទាប និង keyboard user មិនអាចប្រើបាន | ប្តូរទៅ button-like card, add `aria-pressed`, focus ring និង selected state ដែលច្បាស់ |
| Empty state មានតែអត្ថបទ | First-time user មិនទទួលបាន next step ច្បាស់ | បន្ថែម mini empty-state block: “Start with a sentence” + example + primary CTA |
| Settings មិនមាន summary of current values នៅគ្រប់ group | User ត្រូវបើក accordion ដើម្បីដឹងស្ថានភាព | បង្ហាញ compact value summary ដូចជា `16:9 · Stacked · 0.65s` |
| Image upload area មិនមាន drag/drop ឬ file metadata | User មិនដឹងថា upload បានជោគជ័យកម្រិតណា | បង្ហាញ thumbnail, file name/size, replace និង remove actions |
| Status bar តូច និងមានតែ text មួយ | Important success/error messages អាចមើលរំលង | ប្រើ status region មាន color state, `role="status"` និង toast សម្រាប់ action feedback |

## 5. Toggle និង interaction improvement

បច្ចុប្បន្ន project មិនមាន toggle switch ពិតប្រាកដទេ។ មានតែ segmented choices សម្រាប់ ratio/layout និង sliders សម្រាប់ settings។ ដូច្នេះមិនគួរបន្ថែម toggle ច្រើនដោយគ្មាន use case។ ខ្ញុំណែនាំតែ interaction ខាងក្រោម៖

| Interaction | អនុសាសន៍ | អាទិភាព |
|---|---|---|
| **Play / Pause / Stop** | ប្តូរ button ទៅ stateful playback control ដែលមាន icon និង text ច្បាស់; បន្ថែម Stop/Replay នៅពេល playing/finished។ | Must have |
| **Audio on/off** | បន្ថែម compact mute toggle ជិត Play ឬក្នុង Audio group ប្រសិនបើមាន audio loaded។ | Recommended |
| **Dark/light UI mode** | មិនមែន priority ព្រោះ stage ខ្លួនវាមាន dark canvas ហើយ app shell មាន palette រួច។ អាចទុក future។ | Future |
| **Reduced motion** | CSS មាន `prefers-reduced-motion` រួចហើយ; គួរបន្ថែម UI switch តែបើ animation feature កើនឡើង។ | Future |
| **Language toggle** | មិនណែនាំក្នុង phase នេះ ព្រោះ UI ជា English និង content ជា Khmer/English រួច។ បន្ថែមតែពេលមាន localization file ពេញលេញ។ | Not now |

## 6. Responsive Design Review

CSS នៅ `style.css:564–568` ប្រើ breakpoint តែមួយ `max-width: 900px` ហើយប្តូរ three-column grid ទៅ one-column grid។ នេះជាវិធីសាមញ្ញដែលជួយមិនឲ្យ desktop layout ចង្អៀត ប៉ុន្តែវាមិនទាន់ជា responsive editor ពេញលេញទេ។

| Device | បញ្ហាដែលអាចកើត | ដំណោះស្រាយ |
|---|---|---|
| Mobile | Panels ទាំងបីបង្ហាញជាប់គ្នាយ៉ាងវែង; user ត្រូវ scroll ច្រើន ដើម្បីពី Build ទៅ Properties។ | ប្រើ tab/segmented navigation `Build · Preview · Word detail`; បង្ហាញ panel មួយក្នុងពេលតែមួយ ឬ sticky bottom navigation។ |
| Mobile | 9:16 stage អាចធំជាង available width ប្រសិនបើ padding និង browser width តូច។ | ប្រើ `width: min(var(--stage-width), calc(100vw - 32px))` និង aspect-ratio ជំនួស fixed width/height។ |
| Mobile | Topbar actions អាចចង្អៀត ព្រោះ brand និង buttons មានទំហំថេរ។ | Collapse subtitle, wrap actions ឬប្តូរ Save ទៅ icon/text compact។ Touch target គួរមិនតូចជាងប្រហែល 44px។ |
| Tablet | Breakpoint មួយអាចធ្វើឲ្យ tablet ប្តូរទៅ one-column លឿនពេក និងបាត់ editor context។ | បន្ថែម breakpoint ប្រហែល 1100px សម្រាប់ `240px minmax(0,1fr) 280px` និង breakpoint តូចជាងនេះសម្រាប់ tabs។ |
| All sizes | Text ក្នុង stage អាច overflow នៅពេល font size ធំ និង sentence វែង។ | `overflow-wrap:anywhere`, max lines/scale-to-fit ឬ warning នៅពេល content លើស canvas។ |
| All sizes | Stage controls និង word cards មិនមាន loading/empty/error variants ច្បាស់។ | បន្ថែម empty state, “No image”, “Audio ready”, និង export progress states។ |

## 7. Performance Review

សម្រាប់ prototype តូចនេះ performance មូលដ្ឋានគួរតែរហ័ស ព្រោះគ្មាន framework និង dependency runtime។ ទោះយ៉ាងណា មានចំណុចដែលគួរកែលម្អមុនពេលបន្ថែម feature ធំៗ៖

1. **កាត់ full re-render**៖ `renderWordCards()` បង្កើត card និង listener ថ្មីរាល់ input event។ ប្រើ event delegation និង targeted update នឹងកាត់ DOM work។
2. **គ្រប់គ្រង media memory**៖ Base64 images/audio ធំៗអាចបង្កើន memory និងធ្វើឲ្យ JSON ឬ DOM យឺត។ IndexedDB/Blob references សមជាងសម្រាប់ persistence។
3. **គ្រប់គ្រង playback timer**៖ ត្រូវ cancel timer ចាស់ ដើម្បីជៀសវាង callback នៅក្រោយ state ប្តូរ និងការប្រកួតប្រជែងរវាង playback runs។
4. **កុំផ្ទុក fonts ច្រើនពេកបើមិនប្រើ**៖ Google Fonts link ទាញ Poppins, Kantumruy Pro និង Inter។ នេះសមស្របសម្រាប់ current UI ប៉ុន្តែគួរពិនិត្យ weights និង `font-display: swap` នៅពេល production polish។
5. **កុំប្រើ animation លើ element ច្រើនពេក**៖ current transitions មានកម្រិតល្អ ហើយ reduced-motion rule មានរួច។ រក្សា animation តែសម្រាប់ reveal/highlight និង feedback។
6. **Debounce ឬ batch save ប្រសិនបើបន្ថែម autosave**៖ កុំសរសេរ IndexedDB រាល់ keystroke; ប្រើ debounce។

## 8. Code structure ដែលណែនាំ ដោយមិនប្តូរ technology

មិនចាំបាច់ប្តូរ framework ឬបន្ថែម build system សម្រាប់ phase ដំបូងទេ។ Vanilla JS នៅតែសមសម្រាប់ MVP នេះ ប៉ុន្តែគួរបែងចែក `script.js` ទៅជា modules តូចៗនៅពេលចាប់ផ្តើមកែ៖

```text
english-lesson-studio/
├── index.html
├── css/
│   ├── tokens.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js             # bootstrap និង event wiring
│   ├── state.js           # single source of truth + selectors
│   ├── render.js          # render cards, timeline, stage, form
│   ├── playback.js        # play/pause/stop + timer cleanup
│   ├── persistence.js     # export/import JSON + IndexedDB media
│   ├── media.js           # image/audio validation និង object URLs
│   └── utils.js            # uid, status, formatting helpers
├── README.md
└── AUDIT-REPORT.md
```

ការបែងចែកខាងលើគួរធ្វើបន្ទាប់ពីមាន test checklist និង backup មុនកែ។ មិនគួរធ្វើ refactor ទាំងអស់ក្នុង commit តែមួយទេ; គួរធ្វើជា feature-safe commits ដូចជា `playback cleanup`, `persistence`, `responsive shell`, និង `accessibility`។

## 9. Feature Improvement

### Must Have

**Full lesson persistence/import** គឺជាអ្វីដែលគួរធ្វើមុនគេ ព្រោះវាការពារ user work។ Lesson គួររក្សា sentence, word metadata, styles, ratio/layout, background image និង audio references បានពេញលេញ។ ទីពីរ គឺ **Playback controls** ដែលមាន stop/cancel និង state feedback។ ទីបី គឺ **responsive mobile shell** ដែលធ្វើឲ្យ Build, Preview និង Word detail ប្រើបានលើ phone។

### Recommended

បន្ទាប់មកគួរបន្ថែម **Web Speech API pronunciation preview**, **Import lesson**, image validation/replace, និង accessible keyboard workflow។ Export ជា WebM តាម MediaRecorder អាចចាប់ផ្តើមមុន MP4 ព្រោះវាសមនឹង browser-native scope ជាង; MP4 conversion គួរបង្ហាញថាជា optional/heavy operation។

### Advanced / Future

សម្រាប់ future version អាចបន្ថែម drag-to-reorder timeline, quiz mode, lesson templates, autosave/version history, caption timing per word, multi-scene lessons និង export pipeline ដែលមាន progress/cancel។ Feature ទាំងនេះមិនគួរចាប់ផ្តើម មុនពេល persistence និង responsive foundation រួចទេ។

## 10. Improvement Roadmap

| Phase | គោលដៅ | លទ្ធផលដែលគួរទទួលបាន | អាទិភាព |
|---|---|---|---|
| **Phase 1 — Fix Bugs និង protect data** | កែ save limitations, playback cleanup, validation និង state loss warning | Lesson មិនបាត់ data សំខាន់; playback អាច stop; file errors មាន feedback | ចាប់ផ្តើមមុនគេ |
| **Phase 2 — Improve UI/UX** | កែ hierarchy, empty states, status feedback, accessible controls | UI ស្អាត និង user ដឹង next action គ្រប់ screen | បន្ទាប់ពី Phase 1 |
| **Phase 3 — Improve Toggle & Interaction** | Play/Pause/Stop, audio mute, selected/focus states | Interaction ទំនើប និង touch/keyboard friendly | បន្ទាប់ |
| **Phase 4 — Add Important Features** | Import, pronunciation, WebM export ឬ IndexedDB media | Workflow មានប្រយោជន៍ជាក់ស្តែងជាង prototype | បន្ទាប់ពី foundation |
| **Phase 5 — Performance Optimization** | Targeted rendering, media memory strategy, debounce/autosave | typing/playback smooth និង storage មានប្រសិទ្ធភាព | បន្ទាប់ពី feature scope ច្បាស់ |
| **Phase 6 — Final Polish** | Visual consistency, responsive QA, browser testing, docs | Release-ready MVP និង maintainability | ចុងក្រោយ |

## 11. សេចក្ដីសន្និដ្ឋាន

Project នេះមាន **good foundation** និងមិនត្រូវការ rewrite ទេ។ សំណើដែលមាន value ខ្ពស់បំផុតគឺ៖ **កុំអោយ Save បាត់ media**, **ធ្វើ playback ឲ្យអាចគ្រប់គ្រងបាន**, និង **រៀបចំ mobile layout ជា focused workflow**។ បន្ទាប់មកទើបធ្វើ UI polish និង feature បន្ថែម។ វិធីនេះរក្សា existing functionality និងបន្ថយហានិភ័យប៉ះទង្គិចរវាង feature។

### តើអ្នកចង់ឲ្យខ្ញុំចាប់ផ្តើមកែ Phase ណាមុន?

ខ្ញុំណែនាំឲ្យចាប់ផ្តើមពី **Phase 1 — Fix Bugs និង protect data**។ នៅពេលអ្នកជ្រើស phase ខ្ញុំនឹងប្រាប់ជាមុនថាត្រូវកែ file ណាខ្លះ និងផ្នែកណាខ្លះ បន្ទាប់មកទើបបង្កើត code ដែលបានកែ។
