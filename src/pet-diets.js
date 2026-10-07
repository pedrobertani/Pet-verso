// Game food categories, independent of habitat and animation rig.
// Add a species ID here to reuse its food icon throughout the interface.
export const dietGroups={
 carnivore:['pets-0','pets-7','exoticos-0','exoticos-1','exoticos-2','exoticos-5','selva-0','selva-3','selva-7','selva-polar','exoticos-penguin','dinos-0','dinos-4','dinos-pterosaur','exoticos-frog','selva-owl','sombrios-dragon','sombrios-4','sombrios-5'],
 herbivore:['pets-2','pets-4','exoticos-3','exoticos-6','selva-2','selva-4','selva-5','selva-6','selva-capybara','dinos-1','dinos-2','dinos-3','dinos-5','dinos-6','dinos-7'],
 omnivore:['pets-1','pets-3','pets-5','pets-6','pets-mouse','exoticos-4','exoticos-7','selva-1','selva-brown','selva-fox','sombrios-0','sombrios-1','sombrios-2','sombrios-3','sombrios-6','sombrios-7']
};
export const diets={carnivore:{name:'Carnívoro',icon:'chicken'},herbivore:{name:'Herbívoro',icon:'leaf'},omnivore:{name:'Onívoro',icon:'apple'}};
export function dietForSpecies(id){return Object.keys(dietGroups).find(key=>dietGroups[key].includes(id))||'omnivore';}
export function foodIcon(id){return diets[dietForSpecies(id)].icon;}
