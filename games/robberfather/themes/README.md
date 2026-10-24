# Swapping backgrounds

The current character art is generated raster art reduced to a small native resolution and palette. The new backgrounds are generated raster environment plates in a matching muted, textured style; they are not described as hand-placed pixel art.

`config.js` selects `ACTIVE_THEME`. Set it to `'classic'` to restore all previous procedural backgrounds without changing game rules, characters or saved games.

The new version lives entirely in `painted-city-v1/`. Its `backgrounds.png` has four equal panels: street (upper left), home (upper right), shop (lower left), gambling alley (lower right). Add a sibling directory and a new registry entry to keep a future version separate. `sourceGround` maps each panel's floor seam to the game's existing ground height; `fx` sets the camera-effect strength. Interactive doors, signs and the shell-game table remain code layers at their actual gameplay positions.

Generated with the built-in imagegen tool. Prompt: four separate, equal 16:9 environment panels in a strict 2×2 atlas, no people or text; worn old-European street, humble home alley, modest shop and dangerous gambling alley, with matte brick/wood/plaster textures and restrained olive/brown light matching the existing characters. No magic, excessive bloom or poster composition.

`props.png` in the same theme folder contains matching crate, metal bin, gambling table/cups and empty bowl assets in a 2×2 transparent atlas. It was generated with the built-in imagegen tool using the same environment reference, with worn matte wood/metal/ceramic and no characters or background.

## Side street revision 2

Active theme: side-street-v2. The independent background is themes/side-street-v2/alley.png. The old atlas stays in painted-city-v1/backgrounds.png; select painted-city-v1 in config.js to restore its previous composition. Select classic for the older procedural environment. No save migration is needed.

Street facade crops are centred on each SHOPS entry's door coordinate rather than repeating unrelated shop doors. ARCHITECTURE in config.js stores calibrated source door centres and architectural scales. Alley exits are drawn at the same local x=150 used by the simulation. Facades now use 55% of the original scale, room architecture 60%, and walking adults use sprite scale 1.75 (previously 1.3). Width, story positions and existing saved locations remain compatible.

New art was made using the built-in imagegen tool, with the existing atlas as a style reference. Final background prompt: strict side-on orthographic horizontal brick alley, uninterrupted left-right stone pavement, small barred windows, one modest left-hand wooden door, pipes and muted lantern, worn restrained olive-brown textures. No receding or upward path, people, UI, bins, crates or table. Ground seam was calibrated from the generated result.

Character action sheet: assets/actions-v3.png, separate from the existing walking/eating atlases. Built-in imagegen prompt: transparent 2-row, 4-column whole-body sheet matching the child and hooded thug identities; child hesitant, reaching, wallet-held and recoiling poses; thug raises a short wooden cosh, prepares, strikes left and follows through. Connected hands, fixed limb lengths, no detached props or background. Each pose is cropped, sampled to native sprite height and reduced to its character's existing 24-colour palette. The source is generated raster art, not manually placed pixel art.

Controls and volume are independent of story saves: settings.js, local storage one-more-meal-settings-v1. Escape is fixed; gameplay bindings are configurable, conflicts swap the two actions, and Reset restores defaults. Control labels in the tutorials, HUD and help follow the current bindings.
