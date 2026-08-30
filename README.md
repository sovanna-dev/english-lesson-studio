# English Lesson Studio — Prototype

ដំណើរការ​ដោយ​មិន​ចាំបាច់ install អ្វី​ទាំងអស់។ (Runs with zero install.)

## របៀបប្រើ (How to run)

1. ដោះ zip file ចេញ (unzip the file)
2. Double-click `index.html` — វានឹងបើកក្នុង browser (Chrome/Edge/Firefox)
3. រួចរាល់! គ្មាន server ចាំបាច់ទេ

## អ្វីដែលដំណើរការហើយ (What already works)

- វាយ sentence ជាភាសាអង់គ្លេស → click **"＋ Break into words"** → បំបែកជា word cards
- Click word card ណាមួយ → បញ្ចូល **Khmer meaning**, part of speech, example sentence
- Upload រូបភាព (image) ភ្ជាប់ទៅនឹងពាក្យនីមួយៗ
- ជ្រើសរើស **aspect ratio**៖ 16:9 (YouTube), 9:16 (TikTok/Reels), 1:1 (Instagram)
- ចុច **▶ Play** → មើល animation បង្ហាញពាក្យម្តងមួយៗ ព្រមទាំងរូបភាព
- ចុច **Save lesson** → download ជា `lesson.json` (រក្សាទុក data)

## អ្វីដែលមិនទាន់ដំណើរការ (Not built yet — intentionally, for MVP scope)

- **Export MP4** — ប៊ូតុងមាន ប៉ុន្តែមិនទាន់ភ្ជាប់ logic ។ វិធីធ្វើដោយឥតគិតថ្លៃ៖
  1. ប្រើ `MediaRecorder API` (built-in browser) ថត canvas ពេល animation កំពុងលេង
  2. ចម្លង stage area ចូល `<canvas>` element ជាមួយ `requestAnimationFrame`
  3. ថត stream ចេញជា `.webm` ជាមុន រួច convert ទៅ `.mp4` ដោយប្រើ `ffmpeg.wasm` (ដំណើរការក្នុង browser ទាំងស្រុង)
  - ចំណុចនេះមិនចាំបាច់ server ទេ — ដំណើរការនៅលើ computer អ្នកប្រើ 100%

- **Pronunciation audio** — អាចប្រើ `Web Speech API` (built-in text-to-speech, ឥតគិតថ្លៃ)
- **រក្សាទុករូបភាព** — បច្ចុប្បន្ន `lesson.json` មិន save រូបភាពទេ (ដើម្បីរក្សា file តូច)។ ជំហានបន្ទាប់៖ ប្រើ `IndexedDB` (storage ក្នុង browser) ដើម្បី save រូបភាពជាមួយ lesson ពិតៗ
- Drag-to-reorder សម្រាប់ word timeline
- Quiz mode

## Stack ដែលប្រើ (ឥតគិតថ្លៃទាំងស្រុង)

| ផ្នែក | Technology | ថ្លៃដើម |
|---|---|---|
| UI | Vanilla HTML/CSS/JS | ឥតគិតថ្លៃ |
| Khmer font | Kantumruy Pro (Google Fonts) | ឥតគិតថ្លៃ |
| English font | Poppins + Inter (Google Fonts) | ឥតគិតថ្លៃ |
| Image storage (prototype) | Browser memory (base64) | ឥតគិតថ្លៃ |
| Hosting (production) | Vercel / Netlify free tier | ឥតគិតថ្លៃ |

## រចនាសម្ព័ន្ធ file (File structure)

```
english-lesson-studio/
├── index.html   — layout: elements sidebar / stage / properties panel
├── style.css    — design tokens, colors, fonts, aspect-ratio stage
├── script.js    — word breakdown, selection, image upload, play preview
└── README.md    — this file
```

## ជំហានបន្ទាប់ដែលខ្ញុំណែនាំ (Suggested next steps)

1. សាកល្បង prototype នេះជាមួយ sentence ច្រើនប្រភេទ
2. បន្ថែម MediaRecorder export (ខ្ញុំអាចជួយសរសេរបន្ថែម)
3. រៀបចំ IndexedDB សម្រាប់ save រូបភាព permanently
4. បន្ថែម Web Speech API សម្រាប់ pronunciation
