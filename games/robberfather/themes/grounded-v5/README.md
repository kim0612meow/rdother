# Grounded v5 / cover update (game v8)

이번 자산은 built-in `image_gen.imagegen`으로 생성했습니다. 기존 파일은 보존하며, 환경 그림은 `themes/config.js`의 `grounded-v5` 항목으로 분리했습니다. 환경 그림만 되돌리려면 `ACTIVE_THEME`을 `grounded-v4`로 바꿀 수 있습니다.

## 저장 파일

- `C:/projects/pai-games/games/robberfather/themes/grounded-v5/alley.png`: 위층까지 꽉 찬 뒷골목 벽면. 원본 1536×1024, 문 중심 x=280. 그림의 문은 실제 출구 x=150에 맞춥니다.
- `C:/projects/pai-games/games/robberfather/themes/grounded-v5/storage.png`: 실내 엄폐용 바퀴 없는 수납장. 런타임에서 투명 여백을 자르고 기존 엄폐물 폭을 유지합니다.
- `C:/projects/pai-games/games/robberfather/assets/crouch-v4.png`: 아빠 웅크림 4자세. 걷기/식사 자산은 유지합니다. 런타임에서 native 높이 58/52/45/42, 기존 아빠의 24색 팔레트로 변환합니다. 두 줄의 분리선은 y=550으로 잡아 첫 줄 발끝이 아래 프레임에 섞이지 않게 했습니다.

## 동작과 배치

- 거리와 실내의 발선은 화면 높이의 85%, 바닥은 약 15%로 제한합니다. 기존 약 27%였던 전경을 줄였습니다.
- 거리 수레의 빈 오른쪽 짐칸 대신 왼쪽 적재물 뒤로 몸을 낮춥니다. 앉은 자세를 쓰지 않고 네 개의 온전한 웅크림 그림을 0.28초 동안 전환하며, 일어날 때는 역순입니다. 팔이나 다리를 늘리는 변형은 없습니다.
- `BOXES`의 기존 id와 저장된 `boxId`는 그대로 유지합니다. `inside`는 수납장을 선택하며, 실내에서 수레 그림을 사용하지 않습니다. 즉시 숨기 안전 판정, 상호작용 거리, 추격과 게임 규칙은 그대로입니다.
- 골목 벽 그림은 y=0부터 발선까지 채우고 문 부분의 폭을 따로 보정합니다. 텍스처 바탕만 보이는 위쪽 공백이 없습니다.
- 실내 천장 여백에는 대각선 보를 잘라 반복하던 작은 조각 대신 보 사이의 나무판 재질을 사용합니다.
- 바닥의 키 안내는 HUD와 겹치지 않도록 오른쪽에 배치합니다.

## 최종 생성 프롬프트

### Crouch sprite sheet

Use case: identity-preserve. Production transparent 2D game SPRITE SHEET, exactly 2 rows by 2 columns, four isolated full-body poses of ONLY the FIRST character (father) in the reference. Preserve his brown flat cap, tired dark-haired stubbled face, rust scarf, patched olive coat, dark trousers and worn boots. Match reference restrained earthy textured 16-bit raster pixel-art aesthetic, no smooth vector shapes. Orthographic side view facing right, same adult anatomy and scale. Read order: (1) bends both knees into a half squat, hands tucked close to knees; (2) deep balanced squat, heels on ground; (3) leans forward in a low crouch, head lowered; (4) tightly tucked crouch hiding behind cover, forearms resting close to knees. This is crouching on both feet, NOT sitting on the ground, no dangling or extended legs. Same compact body proportions across frames, all limbs connected and fixed lengths. Four equal cells, substantial transparent gutter, no overlap. Complete feet in each cell on the same relative baseline. No objects, no cart, no labels, no floor, no ground shadow, no background. Genuinely transparent alpha.

Reference: `assets/people-pixel-v2.png`. Transparent background requested.

### Indoor cupboard

Use case: stylized-concept. Production transparent 2D game cover prop matching this old general-store interior reference: ONE freestanding waist-high storage cupboard with closed worn dark wooden panel doors, a small stack of folded coarse linen and two wicker stock baskets on its top. Strict side-on orthographic front view, flat base, roughly 1.6 times wider than tall. This is indoor storage behind which a crouching adult can hide. Solid opaque silhouette across the full width, panels reaching almost to floor. Matte brown wood, dull iron hinges, dusty muted olive-beige linen, handworked earthy texture and restrained 16-bit game art readability. No wheels, no cart handles, no people, no room, no floor or ground shadow, no writing. Entire object isolated with generous truly transparent alpha margin. Match reference physical material and palette, no glow or polished metallic surfaces.

Reference: `themes/grounded-v4/shop.png`. Transparent background requested.

### Upper-storey alley

Use case: precise-object-edit. A new production 2D SIDE-SCROLLING game background building wall matching this reference brick alley style, but with TWO COMPLETE UPPER FLOORS so architecture fills the top of the screen. Landscape 3:2 image, strict straight-on orthographic side elevation, one continuous wall edge to edge and TOP to bottom. Worn muted brown/red brick, pale ochre cracked plaster, small shuttered upstairs windows, two rainwater pipes, restrained ivy, one dim wall lantern. No sky, no fog, no blank empty upper area: complete upper-storey masonry and windows occupy the upper 70% of the image. A SINGLE modest dark arched wooden exit door at 12% of image width, only from y=75% to the very bottom edge (adult-sized ground-floor door), no other doorway. Ground floor barred windows at right. The wall ends FLUSH at the BOTTOM edge: do not draw pavement, walkway, foundation, retaining wall, steps, buildings in depth or a path receding upward. No text, signs, people, carts, garbage bins, tables or gameplay props. Restrained matte textured 16-bit inspired environment raster matching existing game; readable, no cinematic lighting. Architecture must form one coherent facade, not pasted tiles.

Reference: `themes/side-street-v2/alley.png`. Opaque background requested. Actual generated door centre is calibrated from the resulting image, rather than assuming the prompt's coordinate was exact.

## 검증 자료

`node --test tools/robberfather.test.mjs`: 24개 검사. 기존 저장 id의 실내/실외 엄폐, 시점별 바닥 비율, 골목 위쪽 채움과 문 중심, 기존 출입/추격/돈/튜토리얼 검사 포함.

`C:/projects/output/robberfather-v8-*.png`: 거리, 수레 엄폐/전환, 실내 수납장, 골목과 출구, 웅크림 자세 캡처. 검수는 실제 플레이와 다른 4178 포트의 저장소에서 진행했습니다. 4174의 플레이 저장은 덮어쓰지 않았습니다.
