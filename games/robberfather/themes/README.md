# Swapping backgrounds

The current character art is generated raster art reduced to a small native resolution and palette. The new backgrounds are generated raster environment plates in a matching muted, textured style; they are not described as hand-placed pixel art.

`config.js` selects `ACTIVE_THEME`. Set it to `'classic'` to restore all previous procedural backgrounds without changing game rules, characters or saved games.

The new version lives entirely in `painted-city-v1/`. Its `backgrounds.png` has four equal panels: street (upper left), home (upper right), shop (lower left), gambling alley (lower right). Add a sibling directory and a new registry entry to keep a future version separate. `sourceGround` maps each panel's floor seam to the game's existing ground height; `fx` sets the camera-effect strength. Interactive doors, signs and the shell-game table remain code layers at their actual gameplay positions.

Generated with the built-in imagegen tool. Prompt: four separate, equal 16:9 environment panels in a strict 2×2 atlas, no people or text; worn old-European street, humble home alley, modest shop and dangerous gambling alley, with matte brick/wood/plaster textures and restrained olive/brown light matching the existing characters. No magic, excessive bloom or poster composition.

`props.png` in the same theme folder contains matching crate, metal bin, gambling table/cups and empty bowl assets in a 2×2 transparent atlas. It was generated with the built-in imagegen tool using the same environment reference, with worn matte wood/metal/ceramic and no characters or background.
