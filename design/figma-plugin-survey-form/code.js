/**
 * FedFit — генератор макета опросника для POST /recommend
 * ES5-синтаксис для совместимости с sandbox Figma Plugin API
 */

var COLORS = {
  bg: { r: 0.169, g: 0.169, b: 0.169 },
  header: { r: 0, g: 0, b: 0 },
  modal: { r: 0.169, g: 0.169, b: 0.169 },
  elevated: { r: 0.118, g: 0.118, b: 0.118 },
  glass: { r: 0.85, g: 0.85, b: 0.85, a: 0.12 },
  white: { r: 1, g: 1, b: 1 },
  gold: { r: 0.776, g: 0.588, b: 0.302 },
  goldDeep: { r: 0.376, g: 0.286, b: 0.145 },
  green: { r: 0.349, g: 0.741, b: 0.337 },
  muted: { r: 1, g: 1, b: 1, a: 0.65 },
  border: { r: 0.227, g: 0.227, b: 0.227 },
  overlay: { r: 0, g: 0, b: 0, a: 0.57 },
};

var GRADIENT_GOLD = {
  type: "GRADIENT_LINEAR",
  gradientTransform: [
    [1, 0, 0],
    [0, 1, 0],
  ],
  gradientStops: [
    { position: 0, color: { r: 0.776, g: 0.588, b: 0.302, a: 1 } },
    { position: 1, color: { r: 0.376, g: 0.286, b: 0.145, a: 1 } },
  ],
};

var GRADIENT_CTA = {
  type: "GRADIENT_LINEAR",
  gradientTransform: [
    [1, 0, 0],
    [0, 1, 0],
  ],
  gradientStops: [
    { position: 0.58, color: { r: 0.965, g: 0.733, b: 0.376, a: 1 } },
    { position: 1, color: { r: 0.376, g: 0.286, b: 0.145, a: 1 } },
  ],
};

var STEPS = [
  { id: "goal", label: "Цель" },
  { id: "equipment", label: "Инвентарь" },
  { id: "rhythm", label: "Ритм" },
  { id: "health", label: "Здоровье" },
];

var FONTS = {
  display: { family: "Montserrat", style: "SemiBold" },
  displayRegular: { family: "Montserrat", style: "Regular" },
  body: { family: "Roboto", style: "Regular" },
  bodyMedium: { family: "Roboto", style: "Medium" },
};

var FONT_LIST = [
  FONTS.display,
  FONTS.displayRegular,
  FONTS.body,
  FONTS.bodyMedium,
];

function cloneGradient(gradient) {
  return JSON.parse(JSON.stringify(gradient));
}

function loadFonts(index, callback) {
  if (index >= FONT_LIST.length) {
    callback();
    return;
  }
  var font = FONT_LIST[index];
  figma.loadFontAsync(font).then(function () {
    loadFonts(index + 1, callback);
  }).catch(function () {
    figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(function () {
      loadFonts(index + 1, callback);
    }).catch(function () {
      loadFonts(index + 1, callback);
    });
  });
}

function solid(color) {
  var opacity = color.a !== undefined && color.a !== null ? color.a : 1;
  return [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b }, opacity: opacity }];
}

function createText(content, font, size, color, align) {
  if (align === undefined) align = "LEFT";
  var node = figma.createText();
  node.fontName = font;
  node.characters = content;
  node.fontSize = size;
  node.fills = solid(color);
  node.textAlignHorizontal = align;
  node.textAutoResize = "WIDTH_AND_HEIGHT";
  return node;
}

function createRect(w, h, fills, radius) {
  var rect = figma.createRectangle();
  rect.resize(w, h);
  rect.fills = fills;
  if (radius) rect.cornerRadius = radius;
  return rect;
}

function createFrame(name, w, h, layoutMode) {
  if (layoutMode === undefined) layoutMode = "NONE";
  var frame = figma.createFrame();
  frame.name = name;
  frame.resize(w, h);
  frame.layoutMode = layoutMode;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = layoutMode === "NONE" ? "FIXED" : "AUTO";
  frame.fills = [];
  frame.clipsContent = false;
  return frame;
}

function applyAutoLayout(frame, opts) {
  if (!opts) opts = {};
  frame.layoutMode = opts.mode || "VERTICAL";
  frame.primaryAxisAlignItems = opts.primaryAlign || "MIN";
  frame.counterAxisAlignItems = opts.counterAlign || "MIN";
  frame.itemSpacing = opts.gap !== undefined ? opts.gap : 16;
  frame.paddingTop = opts.pt !== undefined ? opts.pt : 0;
  frame.paddingBottom = opts.pb !== undefined ? opts.pb : 0;
  frame.paddingLeft = opts.pl !== undefined ? opts.pl : 0;
  frame.paddingRight = opts.pr !== undefined ? opts.pr : 0;
}

function createChip(label, selected, width) {
  if (selected === undefined) selected = false;
  if (width === undefined) width = 0;
  var chip = createFrame("Chip / " + label, width || 140, 48, "HORIZONTAL");
  chip.layoutMode = "HORIZONTAL";
  chip.primaryAxisAlignItems = "CENTER";
  chip.counterAxisAlignItems = "CENTER";
  chip.paddingLeft = 20;
  chip.paddingRight = 20;
  chip.cornerRadius = 50;
  chip.fills = selected ? [cloneGradient(GRADIENT_GOLD)] : solid(COLORS.elevated);
  chip.strokes = selected ? [] : [{ type: "SOLID", color: COLORS.border }];
  chip.strokeWeight = 1;
  if (!width) {
    chip.primaryAxisSizingMode = "AUTO";
    chip.counterAxisSizingMode = "FIXED";
  }
  var text = createText(label, FONTS.body, 16, selected ? COLORS.header : COLORS.white, "CENTER");
  chip.appendChild(text);
  return chip;
}

function createTile(label, selected) {
  if (selected === undefined) selected = false;
  var tile = createFrame("Tile / " + label, 168, 88, "HORIZONTAL");
  tile.layoutMode = "HORIZONTAL";
  tile.primaryAxisAlignItems = "CENTER";
  tile.counterAxisAlignItems = "CENTER";
  tile.cornerRadius = 20;
  tile.fills = solid(COLORS.elevated);
  tile.strokes = [{ type: "SOLID", color: selected ? COLORS.gold : COLORS.border }];
  tile.strokeWeight = selected ? 2 : 1;
  tile.paddingLeft = 12;
  tile.paddingRight = 12;
  var text = createText(label, FONTS.body, 16, COLORS.white, "CENTER");
  tile.appendChild(text);
  if (selected) {
    var check = createText("\u2713", FONTS.bodyMedium, 14, COLORS.gold, "CENTER");
    check.x = 148;
    check.y = 8;
    tile.appendChild(check);
  }
  return tile;
}

function createProgressRail(activeIndex) {
  var rail = createFrame("Progress / Недельная дорожка", 620, 56, "HORIZONTAL");
  applyAutoLayout(rail, { mode: "HORIZONTAL", gap: 0, counterAlign: "CENTER", primaryAlign: "SPACE_BETWEEN" });
  rail.resize(620, 56);

  for (var i = 0; i < STEPS.length; i++) {
    var step = STEPS[i];
    var stepWrap = createFrame("Step " + (i + 1), 120, 56, "VERTICAL");
    applyAutoLayout(stepWrap, { mode: "VERTICAL", gap: 8, counterAlign: "CENTER", primaryAlign: "CENTER" });

    var dot = figma.createEllipse();
    dot.resize(16, 16);
    dot.fills = i <= activeIndex ? [cloneGradient(GRADIENT_GOLD)] : solid({ r: COLORS.border.r, g: COLORS.border.g, b: COLORS.border.b, a: 1 });
    dot.strokes = i === activeIndex ? [{ type: "SOLID", color: COLORS.gold }] : [];
    dot.strokeWeight = 2;

    var label = createText(
      step.label,
      FONTS.body,
      12,
      i <= activeIndex ? COLORS.gold : COLORS.muted,
      "CENTER"
    );

    stepWrap.appendChild(dot);
    stepWrap.appendChild(label);
    rail.appendChild(stepWrap);
  }

  return rail;
}

function createModalShell(activeStep) {
  var modal = createFrame("Modal / Шаг " + (activeStep + 1), 780, 720);
  modal.cornerRadius = 25;
  modal.fills = solid(COLORS.modal);
  modal.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.4 },
      offset: { x: 0, y: 4 },
      radius: 24,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  var content = createFrame("Content", 680, 600, "VERTICAL");
  content.x = 50;
  content.y = 48;
  applyAutoLayout(content, { mode: "VERTICAL", gap: 32, counterAlign: "MIN" });

  var headerRow = createFrame("Header row", 680, 40, "HORIZONTAL");
  applyAutoLayout(headerRow, { mode: "HORIZONTAL", gap: 0, primaryAlign: "SPACE_BETWEEN", counterAlign: "CENTER" });
  headerRow.layoutAlign = "STRETCH";
  headerRow.primaryAxisSizingMode = "FIXED";
  headerRow.counterAxisSizingMode = "FIXED";
  headerRow.resize(680, 40);

  var title = createText("Составим ваш план", FONTS.display, 32, COLORS.white, "LEFT");
  var closeBtn = createFrame("Close", 32, 32);
  closeBtn.cornerRadius = 16;
  closeBtn.fills = solid(COLORS.elevated);
  var closeX = createText("\u00D7", FONTS.body, 20, COLORS.muted, "CENTER");
  closeBtn.appendChild(closeX);
  headerRow.appendChild(title);
  headerRow.appendChild(closeBtn);

  var progress = createProgressRail(activeStep);
  content.appendChild(headerRow);
  content.appendChild(progress);

  var panel = createFrame("Glass panel", 680, 400, "VERTICAL");
  panel.cornerRadius = 20;
  panel.fills = solid(COLORS.glass);
  applyAutoLayout(panel, { mode: "VERTICAL", gap: 24, pt: 32, pb: 32, pl: 32, pr: 32 });
  panel.layoutAlign = "STRETCH";
  panel.primaryAxisSizingMode = "AUTO";

  return { modal: modal, content: content, panel: panel };
}

function createActions(showBack, primaryLabel) {
  if (showBack === undefined) showBack = false;
  if (primaryLabel === undefined) primaryLabel = "Далее";

  var actions = createFrame("Actions", 680, 58, "HORIZONTAL");
  applyAutoLayout(actions, {
    mode: "HORIZONTAL",
    gap: 20,
    primaryAlign: showBack ? "SPACE_BETWEEN" : "MAX",
    counterAlign: "CENTER",
  });
  actions.layoutAlign = "STRETCH";
  actions.resize(680, 58);

  if (showBack) {
    var back = createFrame("Button / Назад", 160, 58, "HORIZONTAL");
    applyAutoLayout(back, { mode: "HORIZONTAL", counterAlign: "CENTER", primaryAlign: "CENTER" });
    back.cornerRadius = 50;
    back.fills = solid(COLORS.elevated);
    back.strokes = [{ type: "SOLID", color: COLORS.border }];
    back.strokeWeight = 1;
    back.appendChild(createText("Назад", FONTS.body, 16, COLORS.white, "CENTER"));
    actions.appendChild(back);
  }

  var next = createFrame("Button / " + primaryLabel, 220, 58, "HORIZONTAL");
  applyAutoLayout(next, { mode: "HORIZONTAL", counterAlign: "CENTER", primaryAlign: "CENTER" });
  next.cornerRadius = 50;
  next.fills = [cloneGradient(GRADIENT_CTA)];
  next.appendChild(createText(primaryLabel, FONTS.body, 16, COLORS.header, "CENTER"));
  actions.appendChild(next);

  return actions;
}

function buildStep1(panel) {
  panel.appendChild(createText("Какая у вас цель?", FONTS.displayRegular, 24, COLORS.gold));

  var tilesRow1 = createFrame("Goals row 1", 616, 88, "HORIZONTAL");
  applyAutoLayout(tilesRow1, { mode: "HORIZONTAL", gap: 16 });
  tilesRow1.appendChild(createTile("Похудение", true));
  tilesRow1.appendChild(createTile("Набор массы", false));
  tilesRow1.appendChild(createTile("Выносливость", false));
  panel.appendChild(tilesRow1);

  var tilesRow2 = createFrame("Goals row 2", 616, 88, "HORIZONTAL");
  applyAutoLayout(tilesRow2, { mode: "HORIZONTAL", gap: 16 });
  tilesRow2.appendChild(createTile("Общая форма", false));
  panel.appendChild(tilesRow2);

  panel.appendChild(createText("Ваш уровень", FONTS.displayRegular, 24, COLORS.gold));

  var levels = createFrame("Levels", 616, 48, "HORIZONTAL");
  applyAutoLayout(levels, { mode: "HORIZONTAL", gap: 12 });
  levels.appendChild(createChip("Начинающий", false, 180));
  levels.appendChild(createChip("Средний", true, 140));
  levels.appendChild(createChip("Продвинутый", false, 180));
  panel.appendChild(levels);
}

function buildStep2(panel) {
  panel.appendChild(createText("Что есть под рукой?", FONTS.displayRegular, 24, COLORS.gold));
  panel.appendChild(createText("Выберите весь доступный инвентарь", FONTS.body, 16, COLORS.muted));

  var row1 = createFrame("Equipment row 1", 616, 48, "HORIZONTAL");
  applyAutoLayout(row1, { mode: "HORIZONTAL", gap: 12 });
  row1.appendChild(createChip("Без инвентаря", false));
  row1.appendChild(createChip("Гантели", true));
  row1.appendChild(createChip("Штанга", false));
  panel.appendChild(row1);

  var row2 = createFrame("Equipment row 2", 616, 48, "HORIZONTAL");
  applyAutoLayout(row2, { mode: "HORIZONTAL", gap: 12 });
  row2.appendChild(createChip("Турник", true));
  row2.appendChild(createChip("Гиря", false));
  panel.appendChild(row2);
}

function buildStep3(panel) {
  panel.appendChild(createText("Сколько раз в неделю?", FONTS.displayRegular, 24, COLORS.gold));

  var freq = createFrame("Frequency", 616, 48, "HORIZONTAL");
  applyAutoLayout(freq, { mode: "HORIZONTAL", gap: 8, primaryAlign: "MIN" });
  for (var i = 1; i <= 7; i++) {
    var dayFrame = createFrame("Day " + i, 44, 44, "HORIZONTAL");
    applyAutoLayout(dayFrame, { mode: "HORIZONTAL", counterAlign: "CENTER", primaryAlign: "CENTER" });
    dayFrame.cornerRadius = 22;
    dayFrame.fills = i <= 3 ? [cloneGradient(GRADIENT_GOLD)] : solid(COLORS.elevated);
    dayFrame.strokes = i <= 3 ? [] : [{ type: "SOLID", color: COLORS.border }];
    dayFrame.strokeWeight = 1;
    dayFrame.appendChild(createText(String(i), FONTS.bodyMedium, 16, i <= 3 ? COLORS.header : COLORS.white, "CENTER"));
    freq.appendChild(dayFrame);
  }
  panel.appendChild(freq);
  panel.appendChild(createText("3 тренировки в неделю", FONTS.body, 14, COLORS.muted));
  panel.appendChild(createText("Сколько времени на тренировку?", FONTS.displayRegular, 24, COLORS.gold));

  var duration = createFrame("Duration", 616, 48, "HORIZONTAL");
  applyAutoLayout(duration, { mode: "HORIZONTAL", gap: 12 });
  var durationLabels = ["15 мин", "30 мин", "45 мин", "60 мин"];
  for (var d = 0; d < durationLabels.length; d++) {
    duration.appendChild(createChip(durationLabels[d], d === 2));
  }
  panel.appendChild(duration);
}

function buildStep4(panel) {
  panel.appendChild(createText("Есть ли ограничения?", FONTS.displayRegular, 24, COLORS.gold));
  panel.appendChild(createText("Можно пропустить, если ограничений нет", FONTS.body, 16, COLORS.muted));

  var restrictions = createFrame("Restrictions", 616, 48, "HORIZONTAL");
  applyAutoLayout(restrictions, { mode: "HORIZONTAL", gap: 12 });
  restrictions.appendChild(createChip("Колени", true));
  restrictions.appendChild(createChip("Спина", false));
  restrictions.appendChild(createChip("Плечи", false));
  restrictions.appendChild(createChip("Нет ограничений", false, 180));
  panel.appendChild(restrictions);

  var summary = createFrame("Summary", 616, 160, "VERTICAL");
  summary.cornerRadius = 25;
  summary.fills = solid(COLORS.elevated);
  applyAutoLayout(summary, { mode: "VERTICAL", gap: 12, pt: 24, pb: 24, pl: 28, pr: 28 });
  summary.appendChild(createText("Итог", FONTS.bodyMedium, 14, COLORS.gold));
  summary.appendChild(createText("Похудение \u00B7 Средний уровень", FONTS.body, 18, COLORS.white));
  summary.appendChild(createText("3 раза в неделю \u00B7 45 минут", FONTS.body, 18, COLORS.white));
  summary.appendChild(createText("Гантели, Турник", FONTS.body, 18, COLORS.white));
  summary.appendChild(createText("Ограничение: колени", FONTS.body, 18, COLORS.muted));
  panel.appendChild(summary);
}

var STEP_BUILDERS = [buildStep1, buildStep2, buildStep3, buildStep4];
var STEP_ACTIONS = [
  { showBack: false, label: "Далее" },
  { showBack: true, label: "Далее" },
  { showBack: true, label: "Далее" },
  { showBack: true, label: "Сформировать план" },
];

var STEP_NOTES = ["goal+level", "equipment", "frequency+duration", "restrictions+submit"];

function createStepScreen(stepIndex, xOffset) {
  var screen = createFrame("Опросник / Шаг " + (stepIndex + 1), 1920, 1080);
  screen.fills = solid(COLORS.bg);
  screen.x = xOffset;
  screen.y = 0;

  var overlay = createRect(1920, 1080, solid(COLORS.overlay));
  overlay.name = "Overlay";
  screen.appendChild(overlay);

  var shell = createModalShell(stepIndex);
  var modal = shell.modal;
  var content = shell.content;
  var panel = shell.panel;

  modal.x = 570;
  modal.y = 180;
  STEP_BUILDERS[stepIndex](panel);

  var actionConfig = STEP_ACTIONS[stepIndex];
  var actions = createActions(actionConfig.showBack, actionConfig.label);
  content.appendChild(panel);
  content.appendChild(actions);
  modal.appendChild(content);

  var note = createText("JSON: " + STEP_NOTES[stepIndex], FONTS.body, 12, COLORS.muted, "LEFT");
  note.x = 50;
  note.y = 680;
  note.opacity = 0.5;
  modal.appendChild(note);

  screen.appendChild(modal);
  return screen;
}

function createContextScreen(xOffset) {
  var screen = createFrame("Опросник / Триггер с главной", 1920, 1080);
  screen.fills = solid(COLORS.bg);
  screen.x = xOffset;
  screen.y = 1200;

  var header = createRect(1920, 90, solid(COLORS.header));
  header.name = "Header";
  screen.appendChild(header);

  var ctaHint = createFrame("CTA / Составить план тренировок", 347, 65, "HORIZONTAL");
  ctaHint.x = 1206;
  ctaHint.y = 12;
  ctaHint.cornerRadius = 25;
  ctaHint.fills = [cloneGradient(GRADIENT_CTA)];
  applyAutoLayout(ctaHint, { mode: "HORIZONTAL", counterAlign: "CENTER", primaryAlign: "CENTER", pl: 14, pr: 14 });
  ctaHint.appendChild(createText("Составить план тренировок", FONTS.displayRegular, 24, COLORS.header, "CENTER"));
  screen.appendChild(ctaHint);

  var banner = createRect(1920, 710, solid({ r: COLORS.header.r, g: COLORS.header.g, b: COLORS.header.b, a: 0.3 }));
  banner.y = 90;
  banner.name = "Banner placeholder";
  screen.appendChild(banner);

  var callout = createFrame("Callout", 520, 120, "VERTICAL");
  callout.x = 700;
  callout.y = 820;
  callout.cornerRadius = 16;
  callout.fills = solid(COLORS.elevated);
  callout.strokes = [{ type: "SOLID", color: COLORS.gold }];
  callout.strokeWeight = 1;
  applyAutoLayout(callout, { mode: "VERTICAL", gap: 8, pt: 20, pb: 20, pl: 24, pr: 24 });
  callout.appendChild(createText("Клик по кнопке в шапке", FONTS.bodyMedium, 18, COLORS.gold));
  callout.appendChild(createText("\u2192 открывает модальную форму опросника", FONTS.body, 16, COLORS.white));
  screen.appendChild(callout);

  return screen;
}

function createSpecFrame(xOffset) {
  var spec = createFrame("Опросник / Спецификация полей", 780, 900, "VERTICAL");
  spec.x = xOffset;
  spec.y = 1200;
  spec.fills = solid(COLORS.modal);
  spec.cornerRadius = 25;
  applyAutoLayout(spec, { mode: "VERTICAL", gap: 16, pt: 40, pb: 40, pl: 40, pr: 40 });

  spec.appendChild(createText("UserQuestionnaire \u2192 POST /recommend", FONTS.displayRegular, 24, COLORS.gold));

  var fields = [
    "goal: weight_loss | muscle_gain | endurance | general_fitness",
    "level: beginner | intermediate | advanced",
    "equipment[]: none | dumbbells | barbell | pullup_bar | kettlebell",
    "frequency: 1-7 (int)",
    "duration_preference: 15 | 30 | 45 | 60",
    "restrictions[]: knee | back | shoulder (можно [])",
  ];

  for (var f = 0; f < fields.length; f++) {
    spec.appendChild(createText(fields[f], FONTS.body, 14, COLORS.white));
  }

  spec.appendChild(createText("Пример JSON:", FONTS.bodyMedium, 16, COLORS.gold));
  spec.appendChild(
    createText(
      '{\n  "goal": "weight_loss",\n  "level": "intermediate",\n  "equipment": ["dumbbells", "pullup_bar"],\n  "frequency": 3,\n  "duration_preference": 45,\n  "restrictions": ["knee"]\n}',
      FONTS.body,
      13,
      COLORS.muted
    )
  );

  return spec;
}

function runMain() {
  var page = figma.currentPage;
  var section = createFrame("Опросник - форма плана тренировок", 8200, 2400);
  section.fills = [];

  var screens = [
    createContextScreen(0),
    createStepScreen(0, 2000),
    createStepScreen(1, 4000),
    createStepScreen(2, 6000),
    createStepScreen(3, 8000),
    createSpecFrame(10200),
  ];

  for (var s = 0; s < screens.length; s++) {
    section.appendChild(screens[s]);
  }

  page.appendChild(section);
  figma.viewport.scrollAndZoomIntoView([section]);
  figma.closePlugin("Создано 6 фреймов: триггер + 4 шага + спецификация API");
}

loadFonts(0, function () {
  try {
    runMain();
  } catch (err) {
    figma.closePlugin("Ошибка: " + err.message);
  }
});
