// ===== State =====
// words: [{ id, text, khmer, pos, example, imageData }]
let words = [];
let selectedWordId = null;

// ===== DOM refs =====
const sentenceInput = document.getElementById('sentenceInput');
const grammarInput = document.getElementById('grammarInput');
const stageGrammar = document.getElementById('stageGrammar');
const breakBtn = document.getElementById('breakBtn');
const wordCardsEl = document.getElementById('wordCards');
const timelineListEl = document.getElementById('timelineList');
const stage = document.getElementById('stage');
const stageFrame = document.querySelector('.stage-frame');
const stageSentence = document.getElementById('stageSentence');
const stageImageSlot = document.getElementById('stageImageSlot');
const playBtn = document.getElementById('playBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const ratioGroup = document.getElementById('ratioGroup');

const noSelection = document.getElementById('noSelection');
const wordForm = document.getElementById('wordForm');
const selectedWordDisplay = document.getElementById('selectedWordDisplay');
const khmerInput = document.getElementById('khmerInput');
const posInput = document.getElementById('posInput');
const exampleInput = document.getElementById('exampleInput');
const imagePreviewWrap = document.getElementById('imagePreviewWrap');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const imageUploadHint = document.getElementById('imageUploadHint');
const removeImageBtn = document.getElementById('removeImageBtn');

const saveBtn = document.getElementById('saveBtn');
const exportBtn = document.getElementById('exportBtn');
const statusText = document.getElementById('statusText');

// New settings refs
const layoutGroup = document.getElementById('layoutGroup');
const bgColorInput = document.getElementById('bgColorInput');
const bgImageBtn = document.getElementById('bgImageBtn');
const bgImageInput = document.getElementById('bgImageInput');
const bgImageRemoveBtn = document.getElementById('bgImageRemoveBtn');

const enFontSelect = document.getElementById('enFontSelect');
const enSizeInput = document.getElementById('enSizeInput');
const enSizeVal = document.getElementById('enSizeVal');
const kmFontSelect = document.getElementById('kmFontSelect');
const kmSizeInput = document.getElementById('kmSizeInput');
const kmSizeVal = document.getElementById('kmSizeVal');

const boxBgInput = document.getElementById('boxBgInput');
const boxBorderInput = document.getElementById('boxBorderInput');
const boxRadiusInput = document.getElementById('boxRadiusInput');
const boxRadiusVal = document.getElementById('boxRadiusVal');

const imgSizeInput = document.getElementById('imgSizeInput');
const imgSizeVal = document.getElementById('imgSizeVal');

const audioBtn = document.getElementById('audioBtn');
const audioInput = document.getElementById('audioInput');
const audioRemoveBtn = document.getElementById('audioRemoveBtn');
const volumeInput = document.getElementById('volumeInput');
const audioPlayer = document.getElementById('audioPlayer');

const speedInput = document.getElementById('speedInput');
const speedVal = document.getElementById('speedVal');

const flashEn = document.getElementById('flashEn');
const flashKm = document.getElementById('flashKm');

const root = document.documentElement;
let stepMs = 650; // time per word, configurable
let layoutMode = 'stacked';
let playing = false;
let animationTimer = null;
let exportingVideo = false;

// ===== Helpers =====
function uid() {
  return 'w' + Math.random().toString(36).slice(2, 9);
}

const POS_ABBR = {
  Noun: 'n.',
  Verb: 'v.',
  Adjective: 'adj.',
  Pronoun: 'pron.',
  Preposition: 'prep.',
  Other: 'other'
};

function posLabel(pos) {
  return POS_ABBR[pos] || '';
}

function makePosBadge(pos) {
  const badge = document.createElement('span');
  badge.className = 'pos-badge';
  badge.textContent = posLabel(pos);
  return badge;
}

function setStatus(msg) {
  statusText.textContent = msg;
}

// ===== Grammar label =====
grammarInput.addEventListener('input', renderStageGrammar);

function renderStageGrammar() {
  const grammar = grammarInput.value.trim();
  stageGrammar.textContent = grammar;
  stageGrammar.classList.toggle('hidden', !grammar);
}

// ===== Break sentence into word cards =====
breakBtn.addEventListener('click', () => {
  const raw = sentenceInput.value.trim();
  if (!raw) {
    setStatus('Type a sentence first.');
    return;
  }
  // split on spaces, keep punctuation attached but strip for matching if needed
  const tokens = raw.split(/\s+/).filter(Boolean);
  words = tokens.map(t => ({
    id: uid(),
    text: t,
    khmer: '',
    pos: '',
    example: '',
    imageData: null
  }));
  selectedWordId = null;
  renderWordCards();
  renderTimeline();
  renderStageSentence();
  renderProperties();
  updateFlashcardPreview();
  setStatus(`Broke sentence into ${words.length} words. Click a word to add meaning.`);
});

// ===== Render word cards under the stage =====
function renderWordCards() {
  wordCardsEl.innerHTML = '';
  if (words.length === 0) {
    return;
  }
  words.forEach(w => {
    const card = document.createElement('div');
    card.className = 'word-card' + (w.id === selectedWordId ? ' selected' : '');
    card.dataset.id = w.id;

    const en = document.createElement('div');
    en.className = 'en';
    en.textContent = w.text;
    card.appendChild(en);

    const km = document.createElement('div');
    km.className = 'km';
    km.textContent = w.khmer || '';
    card.appendChild(km);

    if (w.pos) {
      card.appendChild(makePosBadge(w.pos));
    }

    if (w.imageData) {
      const thumb = document.createElement('img');
      thumb.className = 'thumb';
      thumb.src = w.imageData;
      card.appendChild(thumb);
    }

    card.addEventListener('click', () => selectWord(w.id));
    wordCardsEl.appendChild(card);
  });
}

// ===== Render timeline list (left sidebar) =====
function renderTimeline() {
  timelineListEl.innerHTML = '';
  if (words.length === 0) {
    const li = document.createElement('li');
    li.className = 'timeline-empty';
    li.textContent = 'No words yet — break a sentence to begin.';
    timelineListEl.appendChild(li);
    return;
  }
  words.forEach((w, i) => {
    const li = document.createElement('li');
    li.className = 'timeline-item';
    const order = document.createElement('span');
    order.className = 'order';
    order.textContent = i + 1;
    const label = document.createElement('span');
    label.textContent = w.text;
    li.appendChild(order);
    li.appendChild(label);
    timelineListEl.appendChild(li);
  });
}

// ===== Render sentence on stage (all words dim, none revealed until Play) =====
function renderStageSentence() {
  renderStageGrammar();
  stageSentence.innerHTML = '';
  stageImageSlot.classList.remove('visible');
  stageImageSlot.innerHTML = '';
  words.forEach(w => {
    const span = document.createElement('span');
    span.className = 'stage-word';
    span.dataset.id = w.id;

    if (w.pos) {
      span.appendChild(makePosBadge(w.pos));
    }

    const enLine = document.createElement('span');
    enLine.className = 'stage-word-en';
    enLine.textContent = w.text;
    span.appendChild(enLine);

    if (w.khmer) {
      const kmLine = document.createElement('span');
      kmLine.className = 'stage-word-km';
      kmLine.textContent = w.khmer;
      span.appendChild(kmLine);
    }

    stageSentence.appendChild(span);
  });
}

// ===== Update flashcard preview =====
function setFlashcardWord(w) {
  flashEn.innerHTML = '';
  if (w.pos) {
    flashEn.appendChild(makePosBadge(w.pos));
  }
  const enText = document.createElement('span');
  enText.className = 'flash-en-text';
  enText.textContent = w.text;
  flashEn.appendChild(enText);
  flashKm.textContent = w.khmer || '—';
}

function clearFlashcard() {
  flashEn.textContent = '—';
  flashKm.textContent = '—';
}

function updateFlashcardPreview() {
  const w = words.find(x => x.id === selectedWordId) || words[0];
  if (w) {
    setFlashcardWord(w);
  } else {
    clearFlashcard();
  }
}

// ===== Select a word, populate properties panel =====
function selectWord(id) {
  selectedWordId = id;
  renderWordCards();
  renderProperties();
  updateFlashcardPreview();
}

function renderProperties() {
  const w = words.find(x => x.id === selectedWordId);
  if (!w) {
    noSelection.classList.remove('hidden');
    wordForm.classList.add('hidden');
    return;
  }
  noSelection.classList.add('hidden');
  wordForm.classList.remove('hidden');

  selectedWordDisplay.textContent = w.text;
  khmerInput.value = w.khmer || '';
  posInput.value = w.pos || '';
  exampleInput.value = w.example || '';

  if (w.imageData) {
    imagePreview.src = w.imageData;
    imagePreview.classList.remove('hidden');
    imageUploadHint.classList.add('hidden');
    removeImageBtn.classList.remove('hidden');
  } else {
    imagePreview.classList.add('hidden');
    imageUploadHint.classList.remove('hidden');
    removeImageBtn.classList.add('hidden');
  }
}

// ===== Properties panel: live edits =====
khmerInput.addEventListener('input', () => {
  const w = words.find(x => x.id === selectedWordId);
  if (!w) return;
  w.khmer = khmerInput.value;
  renderWordCards();
  renderStageSentence();
  updateFlashcardPreview();
});

posInput.addEventListener('change', () => {
  const w = words.find(x => x.id === selectedWordId);
  if (!w) return;
  w.pos = posInput.value;
  renderWordCards();
  renderStageSentence();
  updateFlashcardPreview();
});

exampleInput.addEventListener('input', () => {
  const w = words.find(x => x.id === selectedWordId);
  if (!w) return;
  w.example = exampleInput.value;
});

// ===== Image upload =====
imagePreviewWrap.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const w = words.find(x => x.id === selectedWordId);
  if (!w) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    w.imageData = ev.target.result;
    renderProperties();
    renderWordCards();
    updateFlashcardPreview();
  };
  reader.readAsDataURL(file);
});

removeImageBtn.addEventListener('click', () => {
  const w = words.find(x => x.id === selectedWordId);
  if (!w) return;
  w.imageData = null;
  imageInput.value = '';
  renderProperties();
  renderWordCards();
  updateFlashcardPreview();
});

// ===== Aspect ratio switching =====
ratioGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.ratio-btn');
  if (!btn) return;
  ratioGroup.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  stage.classList.remove('ratio-16-9', 'ratio-9-16', 'ratio-1-1');
  stage.classList.add('ratio-' + btn.dataset.ratio);
});

// ===== Full-screen preview =====
fullscreenBtn.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await stageFrame.requestFullscreen();
    }
  } catch (error) {
    setStatus('Full screen is not available in this browser.');
  }
});

document.addEventListener('fullscreenchange', () => {
  const isFullscreen = document.fullscreenElement === stageFrame;
  fullscreenBtn.setAttribute('aria-pressed', String(isFullscreen));
  fullscreenBtn.querySelector('span:last-child').textContent = isFullscreen ? 'Exit full screen' : 'Full screen';
});

// ===== Play preview: reveal words one by one, show images when relevant =====
playBtn.addEventListener('click', () => {
  if (playing) {
    // Stop playing
    stopPlayback();
    return;
  }
  if (words.length === 0) {
    setStatus('Please break a sentence first.');
    return;
  }
  startPlayback();
});

function stopPlayback() {
  playing = false;
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
  playBtn.textContent = '▶ Play';
  if (audioPlayer.src) {
    audioPlayer.pause();
  }
  // Reset highlights
  document.querySelectorAll('.stage-word').forEach(el => {
    el.classList.remove('revealed', 'highlight');
  });
  setStatus('Playback stopped.');
}

function startPlayback() {
  playing = true;
  playBtn.textContent = '⏸ Stop';

  // reset
  document.querySelectorAll('.stage-word').forEach(el => {
    el.classList.remove('revealed', 'highlight');
  });
  stageImageSlot.classList.remove('visible');
  stageImageSlot.innerHTML = '';
  flashEn.textContent = '—';
  flashKm.textContent = '—';

  // start audio in sync, if loaded
  if (audioPlayer.src) {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(() => {});
  }

  let i = 0;

  function updateImage(w) {
    if (w.imageData) {
      stageImageSlot.innerHTML = '';
      const img = document.createElement('img');
      img.src = w.imageData;
      img.alt = w.text;
      stageImageSlot.appendChild(img);
      stageImageSlot.classList.add('visible');
    } else {
      stageImageSlot.classList.remove('visible');
      stageImageSlot.innerHTML = '';
    }
  }

  function step() {
    // clear previous highlight
    if (i > 0 && layoutMode === 'stacked') {
      const prevEl = stageSentence.children[i - 1];
      if (prevEl) prevEl.classList.remove('highlight');
    }

    if (i >= words.length) {
      playing = false;
      playBtn.textContent = '▶ Play';
      if (audioPlayer.src) audioPlayer.pause();
      setStatus('Playback complete!');
      return;
    }

    const w = words[i];

    if (layoutMode === 'stacked') {
      const el = stageSentence.children[i];
      if (el) {
        el.classList.add('revealed', 'highlight');
      }
    } else {
      // side-by-side flashcard
      setFlashcardWord(w);
      flashEn.classList.remove('flash-pop');
      flashKm.classList.remove('flash-pop');
      void flashEn.offsetWidth; // restart animation
      flashEn.classList.add('flash-pop');
      flashKm.classList.add('flash-pop');
    }

    updateImage(w);
    setStatus(`Showing word ${i + 1} of ${words.length}: "${w.text}"`);

    i++;
    animationTimer = setTimeout(step, stepMs);
  }
  step();
}

// ===== Layout mode: Stacked vs Side-by-side =====
layoutGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('.ratio-btn');
  if (!btn) return;
  layoutGroup.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  layoutMode = btn.dataset.layout;
  
  // Update stage class
  stage.classList.remove('mode-stacked', 'mode-sidebyside');
  stage.classList.add('mode-' + layoutMode);
  
  // Show/hide appropriate elements
  const flashcard = document.querySelector('.stage-flashcard');
  if (layoutMode === 'stacked') {
    stageSentence.style.display = 'flex';
    flashcard.style.display = 'none';
    // Reset flashcard
    flashEn.textContent = '—';
    flashKm.textContent = '—';
    // Show all words dimmed
    document.querySelectorAll('.stage-word').forEach(el => {
      el.style.display = 'inline';
    });
  } else {
    stageSentence.style.display = 'none';
    flashcard.style.display = 'flex';
    // Update flashcard with selected or first word
    updateFlashcardPreview();
  }
  setStatus(`Switched to ${layoutMode === 'stacked' ? 'Stacked' : 'Side-by-side'} layout`);
});

// ===== Background color / image =====
bgColorInput.addEventListener('input', () => {
  stage.style.setProperty('--stage-bg-color', bgColorInput.value);
});

bgImageBtn.addEventListener('click', () => {
  bgImageInput.value = '';
  if (bgImageBtn.tagName !== 'LABEL') bgImageInput.click();
});

bgImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setStatus('Please choose an image file for the stage background.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    stage.style.backgroundImage = `url("${dataUrl}")`;
    stage.style.setProperty('--stage-bg-image', `url("${dataUrl}")`);
    bgImageRemoveBtn.classList.remove('hidden');
    setStatus(`Background image loaded: ${file.name}`);
  };
  reader.onerror = () => setStatus('Could not read that image. Please try another file.');
  reader.readAsDataURL(file);
});

bgImageRemoveBtn.addEventListener('click', () => {
  stage.style.backgroundImage = 'none';
  stage.style.setProperty('--stage-bg-image', 'none');
  bgImageInput.value = '';
  bgImageRemoveBtn.classList.add('hidden');
  setStatus('Background image removed.');
});

// ===== Text style: font + size for English / Khmer on stage =====
enFontSelect.addEventListener('change', () => {
  stage.style.setProperty('--stage-en-font', enFontSelect.value);
});

enSizeInput.addEventListener('input', () => {
  stage.style.setProperty('--stage-en-size', enSizeInput.value + 'px');
  enSizeVal.textContent = enSizeInput.value + 'px';
});

kmFontSelect.addEventListener('change', () => {
  stage.style.setProperty('--stage-km-font', kmFontSelect.value);
});

kmSizeInput.addEventListener('input', () => {
  stage.style.setProperty('--stage-km-size', kmSizeInput.value + 'px');
  kmSizeVal.textContent = kmSizeInput.value + 'px';
});

// ===== Word box style (applies to word cards under the stage) =====
boxBgInput.addEventListener('input', () => {
  root.style.setProperty('--box-bg', boxBgInput.value);
});

boxBorderInput.addEventListener('input', () => {
  root.style.setProperty('--box-border', boxBorderInput.value);
});

boxRadiusInput.addEventListener('input', () => {
  root.style.setProperty('--box-radius', boxRadiusInput.value + 'px');
  boxRadiusVal.textContent = boxRadiusInput.value + 'px';
});

// ===== Stage image size =====
imgSizeInput.addEventListener('input', () => {
  stage.style.setProperty('--stage-img-size', imgSizeInput.value + 'px');
  imgSizeVal.textContent = imgSizeInput.value + 'px';
});

// ===== Audio (MP3) =====
audioBtn.addEventListener('click', () => audioInput.click());

audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    audioPlayer.src = ev.target.result;
    audioRemoveBtn.classList.remove('hidden');
    setStatus('Audio loaded — it will play from the start when you click Play.');
  };
  reader.readAsDataURL(file);
});

audioRemoveBtn.addEventListener('click', () => {
  audioPlayer.pause();
  audioPlayer.src = '';
  audioInput.value = '';
  audioRemoveBtn.classList.add('hidden');
  setStatus('Audio removed.');
});

volumeInput.addEventListener('input', () => {
  audioPlayer.volume = volumeInput.value / 100;
});
audioPlayer.volume = 0.8;

// ===== Animation speed =====
speedInput.addEventListener('input', () => {
  stepMs = parseInt(speedInput.value, 10);
  speedVal.textContent = (stepMs / 1000).toFixed(2) + 's';
});

// ===== Save lesson (download as JSON — zero server cost) =====
saveBtn.addEventListener('click', () => {
  const lesson = {
    sentence: sentenceInput.value,
    grammar: grammarInput.value,
    ratio: document.querySelector('#ratioGroup .ratio-btn.active')?.dataset.ratio || '16-9',
    layout: layoutMode,
    style: {
      bgColor: bgColorInput.value,
      enFont: enFontSelect.value,
      enSize: enSizeInput.value,
      kmFont: kmFontSelect.value,
      kmSize: kmSizeInput.value,
      boxBg: boxBgInput.value,
      boxBorder: boxBorderInput.value,
      boxRadius: boxRadiusInput.value,
      imgSize: imgSizeInput.value,
      stepMs
    },
    words: words.map(w => ({
      text: w.text,
      khmer: w.khmer,
      pos: w.pos,
      example: w.example,
      hasImage: !!w.imageData
    }))
  };
  const blob = new Blob([JSON.stringify(lesson, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lesson.json';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('Lesson saved as lesson.json.');
});

// ===== Video export (browser-native WebM) =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getExportDimensions() {
  if (stage.classList.contains('ratio-9-16')) {
    return { width: 720, height: 1280 };
  }
  if (stage.classList.contains('ratio-1-1')) {
    return { width: 1080, height: 1080 };
  }
  return { width: 1280, height: 720 };
}

function getSupportedVideoMimeType() {
  if (!window.MediaRecorder) return '';
  return [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ].find(type => MediaRecorder.isTypeSupported(type)) || '';
}

function loadImage(src) {
  return new Promise(resolve => {
    if (!src) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function getStageBackgroundSource() {
  const value = stage.style.getPropertyValue('--stage-bg-image').trim();
  const match = value.match(/^url\(["']?(.*?)["']?\)$/);
  return match ? match[1] : '';
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawStageImage(ctx, image, width, y, scale) {
  if (!image) return y;
  const configuredSize = Math.max(40, Number(imgSizeInput.value) * scale);
  const size = Math.min(configuredSize, width * 0.3, 220 * scale);
  const x = (width - size) / 2;
  ctx.save();
  drawRoundedRect(ctx, x, y, size, size, 14 * scale);
  ctx.clip();
  const ratio = Math.max(size / image.width, size / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  ctx.drawImage(image, x + (size - drawWidth) / 2, y + (size - drawHeight) / 2, drawWidth, drawHeight);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = Math.max(2, scale * 2);
  drawRoundedRect(ctx, x, y, size, size, 14 * scale);
  ctx.stroke();
  return y + size + 18 * scale;
}

function drawGrammarLabel(ctx, text, width, y, scale) {
  if (!text) return y;
  const fontSize = Math.max(16, Math.round(13 * scale));
  ctx.font = `700 ${fontSize}px Inter, sans-serif`;
  const labelWidth = Math.min(width * 0.82, ctx.measureText(text.toUpperCase()).width + 36 * scale);
  const labelHeight = fontSize + 18 * scale;
  const x = (width - labelWidth) / 2;
  ctx.fillStyle = 'rgba(242, 184, 75, 0.2)';
  drawRoundedRect(ctx, x, y, labelWidth, labelHeight, labelHeight / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(242, 184, 75, 0.7)';
  ctx.lineWidth = Math.max(1, scale);
  ctx.stroke();
  ctx.fillStyle = '#ffd071';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), width / 2, y + labelHeight / 2);
  return y + labelHeight;
}

function drawStackedExportFrame(ctx, width, height, activeIndex, scale, activeImage) {
  const fontSize = Math.max(20, Math.round(Number(enSizeInput.value) * scale));
  const kmFontSize = Math.max(15, Math.round(Number(kmSizeInput.value) * scale));
  const gap = Math.max(12, Math.round(fontSize * 0.38));
  const maxLineWidth = width * 0.82;
  const lines = [];
  let currentLine = [];
  let currentWidth = 0;

  ctx.font = `600 ${fontSize}px ${enFontSelect.value}`;
  words.forEach((word, index) => {
    const wordWidth = ctx.measureText(word.text).width;
    const nextWidth = currentLine.length ? currentWidth + gap + wordWidth : wordWidth;
    if (currentLine.length && nextWidth > maxLineWidth) {
      lines.push(currentLine);
      currentLine = [];
      currentWidth = 0;
    }
    currentLine.push({ word, index, width: wordWidth });
    currentWidth = currentLine.length === 1 ? wordWidth : currentWidth + gap + wordWidth;
  });
  if (currentLine.length) lines.push(currentLine);

  const grammar = grammarInput.value.trim();
  const grammarHeight = grammar ? Math.max(38, Math.round(42 * scale)) : 0;
  const imageHeight = activeImage ? Math.min(Math.max(40, Number(imgSizeInput.value) * scale), width * 0.3, 220 * scale) + 18 * scale : 0;
  const lineHeight = Math.round(fontSize * 1.65);
  const totalHeight = imageHeight + grammarHeight + (grammar ? 16 * scale : 0) + lines.length * lineHeight;
  let y = (height - totalHeight) / 2;
  y = drawStageImage(ctx, activeImage, width, y, scale);
  y = drawGrammarLabel(ctx, grammar, width, y, scale);
  if (grammar) y += 16 * scale;

  lines.forEach(line => {
    const lineWidth = line.reduce((sum, entry) => sum + entry.width, 0) + gap * Math.max(0, line.length - 1);
    let x = (width - lineWidth) / 2;
    line.forEach(({ word, index, width: wordWidth }) => {
      const isActive = index === activeIndex;
      const isRevealed = activeIndex >= 0 && index <= activeIndex;
      ctx.globalAlpha = activeIndex < 0 || isRevealed ? 1 : 0.28;
      ctx.fillStyle = isActive ? '#f2b84b' : '#fffdf9';
      ctx.font = `600 ${fontSize}px ${enFontSelect.value}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(word.text, x, y + fontSize);
      if (word.khmer) {
        ctx.globalAlpha *= 0.85;
        ctx.fillStyle = isActive ? '#ffd071' : '#fffdf9';
        ctx.font = `500 ${kmFontSize}px ${kmFontSelect.value}`;
        ctx.fillText(word.khmer, x + (wordWidth - ctx.measureText(word.khmer).width) / 2, y + fontSize + kmFontSize + 5 * scale);
      }
      x += wordWidth + gap;
    });
    y += lineHeight;
  });
  ctx.globalAlpha = 1;
}

function drawSideBySideExportFrame(ctx, width, height, activeIndex, scale, activeImage) {
  const index = activeIndex >= 0 ? activeIndex : 0;
  const word = words[index] || { text: '—', khmer: '' };
  const fontSize = Math.max(20, Math.round(Number(enSizeInput.value) * scale));
  const kmFontSize = Math.max(18, Math.round(Number(kmSizeInput.value) * scale));
  const boxWidth = width * 0.38;
  const boxHeight = Math.max(120, height * 0.25);
  const gap = width * 0.04;
  const left = (width - boxWidth * 2 - gap) / 2;
  const grammar = grammarInput.value.trim();
  const grammarGap = grammar ? Math.round(16 * scale) : 0;
  const imageHeight = activeImage ? Math.min(Math.max(40, Number(imgSizeInput.value) * scale), width * 0.3, 220 * scale) + 18 * scale : 0;
  const totalHeight = imageHeight + boxHeight + (grammar ? Math.max(38, Math.round(42 * scale)) + grammarGap : 0);
  let top = (height - totalHeight) / 2;
  top = drawStageImage(ctx, activeImage, width, top, scale);
  if (grammar) {
    top = drawGrammarLabel(ctx, grammar, width, top, scale) + grammarGap;
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  drawRoundedRect(ctx, left, top, boxWidth, boxHeight, 18 * scale);
  ctx.fill();
  ctx.fillStyle = 'rgba(242, 184, 75, 0.16)';
  drawRoundedRect(ctx, left + boxWidth + gap, top, boxWidth, boxHeight, 18 * scale);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fffdf9';
  ctx.font = `600 ${fontSize}px ${enFontSelect.value}`;
  ctx.fillText(word.text, left + boxWidth / 2, top + boxHeight / 2);
  ctx.fillStyle = '#ffd071';
  ctx.font = `500 ${kmFontSize}px ${kmFontSelect.value}`;
  ctx.fillText(word.khmer || '—', left + boxWidth + gap + boxWidth / 2, top + boxHeight / 2);
}

async function drawExportFrame(ctx, width, height, activeIndex, backgroundImage, activeImage) {
  const scale = width / 640;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bgColorInput.value || '#12142a';
  ctx.fillRect(0, 0, width, height);
  if (backgroundImage) {
    const ratio = Math.max(width / backgroundImage.width, height / backgroundImage.height);
    const drawWidth = backgroundImage.width * ratio;
    const drawHeight = backgroundImage.height * ratio;
    ctx.globalAlpha = 0.88;
    ctx.drawImage(backgroundImage, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    ctx.globalAlpha = 1;
  }
  if (layoutMode === 'sidebyside') {
    drawSideBySideExportFrame(ctx, width, height, activeIndex, scale, activeImage);
  } else {
    drawStackedExportFrame(ctx, width, height, activeIndex, scale, activeImage);
  }
}

async function exportVideo() {
  if (exportingVideo) return;
  if (words.length === 0) {
    setStatus('Please break a sentence before exporting a video.');
    return;
  }
  const mimeType = getSupportedVideoMimeType();
  if (!mimeType || !HTMLCanvasElement.prototype.captureStream) {
    setStatus('Video export is not supported by this browser. Try the latest Chrome, Edge, or Firefox.');
    return;
  }

  exportingVideo = true;
  exportBtn.disabled = true;
  if (playing) stopPlayback();
  setStatus('Preparing video export…');

  const { width, height } = getExportDimensions();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];
  const stopped = new Promise((resolve, reject) => {
    recorder.ondataavailable = event => {
      if (event.data && event.data.size) chunks.push(event.data);
    };
    recorder.onerror = event => reject(event.error || new Error('Video recorder failed.'));
    recorder.onstop = () => resolve();
  });

  try {
    const backgroundImage = await loadImage(getStageBackgroundSource());
    const wordImages = await Promise.all(words.map(word => loadImage(word.imageData)));
    recorder.start(200);
    await drawExportFrame(ctx, width, height, -1, backgroundImage, null);
    await sleep(Math.min(700, Math.max(350, stepMs)));

    for (let index = 0; index < words.length; index += 1) {
      await drawExportFrame(ctx, width, height, index, backgroundImage, wordImages[index]);
      setStatus(`Rendering video: word ${index + 1} of ${words.length}…`);
      await sleep(stepMs);
    }

    recorder.stop();
    await stopped;
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lesson-preview.webm';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Video exported as lesson-preview.webm.');
  } catch (error) {
    if (recorder.state !== 'inactive') recorder.stop();
    setStatus('Could not export the video. Please try again.');
    console.error(error);
  } finally {
    stream.getTracks().forEach(track => track.stop());
    exportingVideo = false;
    exportBtn.disabled = false;
  }
}

exportBtn.addEventListener('click', exportVideo);

// ===== Initialize =====
function initializeApp() {
  // Set initial layout mode
  stage.classList.add('mode-stacked');
  stageSentence.style.display = 'flex';
  document.querySelector('.stage-flashcard').style.display = 'none';
  
  // Set initial flashcard content
  flashEn.textContent = '—';
  flashKm.textContent = '—';
  
  // Set initial stage background color
  stage.style.setProperty('--stage-bg-color', bgColorInput.value);
  
  // Set initial text sizes
  stage.style.setProperty('--stage-en-size', enSizeInput.value + 'px');
  stage.style.setProperty('--stage-km-size', kmSizeInput.value + 'px');
  enSizeVal.textContent = enSizeInput.value + 'px';
  kmSizeVal.textContent = kmSizeInput.value + 'px';
  
  // Set initial image size
  stage.style.setProperty('--stage-img-size', imgSizeInput.value + 'px');
  imgSizeVal.textContent = imgSizeInput.value + 'px';
  
  // Set initial box styles
  root.style.setProperty('--box-bg', boxBgInput.value);
  root.style.setProperty('--box-border', boxBorderInput.value);
  root.style.setProperty('--box-radius', boxRadiusInput.value + 'px');
  boxRadiusVal.textContent = boxRadiusInput.value + 'px';
  
  // Set initial speed
  stepMs = parseInt(speedInput.value, 10);
  speedVal.textContent = (stepMs / 1000).toFixed(2) + 's';
  
  // Render initial state
  renderStageGrammar();
  renderTimeline();
  renderStageSentence();
  renderProperties();
  
  setStatus('Ready — this runs entirely in your browser, no server needed.');
}

// Start the app
initializeApp();