# Grounded v6 / viewport v9

The game canvas follows the actual window ratio, without letterbox bands or stretching. Its height stays 840 native pixels and its width follows the window. Camera crops and lighting buffers use those dimensions, and mouse, dialogue-tail and stamina markers share the new projection. Complete upper-window rows extend the street facades to the top edge; the old tiny wall-patch repeat is removed.

Indoor cover moves to each room's exact centre, local x=720. Legacy cover ids remain stable; an existing hidden save follows its cover to the new centre. Outdoor cover positions, reach and instant safety stay unchanged.

Built-in imagegen edited the two existing transparent props to deepen the occlusion shading. The source images remain available in their older folders. Alpha-masked average luminance changed from 62.1 to 39.2 for the cart and from 58.7 to 38.1 for the cupboard. Local wall/floor shadows make the cover area visibly shaded in the game.

Saved assets:
- C:/projects/pai-games/games/robberfather/themes/grounded-v6/cart.png
- C:/projects/pai-games/games/robberfather/themes/grounded-v6/storage.png

Select grounded-v5 in themes/config.js to restore the prior environment prop art.

## Cart edit prompt

Use case: precise-object-edit. Edit ONLY the lighting/shadow paint of the loaded delivery cart in the reference sprite. Production 2D game HIDEABLE COVER asset. Preserve its exact object silhouette, proportions, positions, materials, wood grain, all wheels or baskets as applicable, and the genuinely transparent background. Keep the same side-on view and whole object. Make it clearly darker than normal street/shop props: the front faces and recesses should be about 35–45% darker, with deep cool brown/olive shadows behind the sacks or folded linen and in the lower panels. Add believable broad occlusion shading with a few restrained upper-edge highlights, readable tactile burlap, wicker and matte weathered wood. The resulting object must read as a sheltered, shadowy hiding place at small game size. Do not turn the sprite into a flat black silhouette: retain separated large shapes and texture. No black rectangle, no surrounding room or floor, no glow, no characters, no text, no arrows, no new decorative parts. No change of identity, no change to pose or framing. True alpha background, no checkerboard.

Reference: themes/lived-street-v3/cover-cart.png; transparent_background=true.

## Cupboard edit prompt

Use case: precise-object-edit. Edit ONLY the lighting/shadow paint of the indoor wooden storage cupboard in the reference sprite. Production 2D game HIDEABLE COVER asset. Preserve its exact object silhouette, proportions, positions, materials, wood grain, all wheels or baskets as applicable, and the genuinely transparent background. Keep the same side-on view and whole object. Make it clearly darker than normal street/shop props: the front faces and recesses should be about 35–45% darker, with deep cool brown/olive shadows behind the sacks or folded linen and in the lower panels. Add believable broad occlusion shading with a few restrained upper-edge highlights, readable tactile burlap, wicker and matte weathered wood. The resulting object must read as a sheltered, shadowy hiding place at small game size. Do not turn the sprite into a flat black silhouette: retain separated large shapes and texture. No black rectangle, no surrounding room or floor, no glow, no characters, no text, no arrows, no new decorative parts. No change of identity, no change to pose or framing. True alpha background, no checkerboard.

Reference: themes/grounded-v5/storage.png; transparent_background=true.

## Validation

28 checks in tools/robberfather.test.mjs cover responsive framing and mouse projection, full upper-facade coverage, central cover and legacy save restoration, plus the existing game rules. Preview scenes use port 4178, separate from the actual player's save on 4174. Browser captures and audit JSON are in C:/projects/output/robberfather-v9-*.
