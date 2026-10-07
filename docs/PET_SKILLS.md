# Pet abilities and needs

All 25 selectable species use the same intelligence thresholds:

| Intelligence | Behavior | Where | Cooldown |
| --- | --- | --- | --- |
| 25 | Follow a tap on free ground | Rooms, yard, playground | None |
| 50 | Species trick | Living room | 15 seconds |
| 75 | Species toy action | Playground | 30 seconds |

Cooldowns are saved. Sleep, death, and bathing block abilities without consuming them. Locked taps show a brief message once per screen visit. The playground remains visible before its ability unlocks.

## Species data

- `engine.js`: selectable species, color variants, and save migration compatibility.
- `pet-diets.js`: explicit species IDs grouped by `carnivore`, `herbivore`, and `omnivore`. Each species receives a `diet` field. The game food icons are chicken, leaf, and apple respectively; these are visual categories rather than a real animal feeding guide.
- `park-environments.js`: habitat per species.
- `park-toys.js`: free toy and its native SVG per species.
- `pet-tricks.js`: 50-intelligence trick.
- `park-actions.js`: 75-intelligence action, toy coordinates, and foreground effects.
- `growth-art.js` and `new-pet-art.js`: baby, young, and adult art.

The food button, hunger meter, and hunger thought all use `foodIcon(speciesId)`. The memory game uses explicit apple, chicken, and leaf symbols independently of the adopted pet.

## Thought cycle

Current needs produce icon-only thoughts. The pet pauses for four seconds, then resumes roaming; the next thought can appear after twelve seconds. Critical needs take priority. Thoughts stop after the corresponding need is met and are suppressed during sleep, bathing, abilities, and dialogs. Touching the scene dismisses the current thought.

Hunger, sleep, hygiene, happiness, and health reuse saved stats. Affection and yard visits use persisted `social.affection` and `social.outdoors` timestamps; older saves fall back to the pet's birth time. These requests do not create extra stats or change existing decay rates.

## Validation

Run `npm test`, `npm run build`, and `npx playwright test`.

Preview scripts render the real SVG and browser animations. `preview-all-park-actions.mjs` checks 25 species across three ages. `preview-colors-thoughts.mjs` checks eight coat variants across three ages and six thought types. `preview-pet-diets.mjs` checks the food button, hunger meter, and thought for each food category.
