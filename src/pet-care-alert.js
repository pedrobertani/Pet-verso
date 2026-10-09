// A compact, accessible thought balloon for pets who need attention.
export function petCareSignal(need,pet={}){
 switch(need){
  case 'health':return pet.ill?{icon:'💊',label:'Preciso de remédio'}:{icon:'❤️',label:'Preciso de cuidados'};
  case 'food':return {icon:'🍗',label:'Estou com fome'};
  case 'hygiene':return (pet.waste||0)>0?{icon:'🧹',label:'Preciso de limpeza'}:{icon:'🚿',label:'Quero um banho'};
  case 'energy':return {icon:'💤',label:'Quero dormir'};
  case 'joy':return {icon:'🧸',label:'Quero brincar'};
  default:return {icon:'💗',label:'Preciso de atenção'};
 }
}
