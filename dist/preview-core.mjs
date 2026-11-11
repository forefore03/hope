// All progress values are illustrative. No user GPS or round state is read.
export function previewValues(hole,green,step=0){
 const supplied=green?.whiteTee?.meters??hole?.whiteTee?.metersByGreen?.[green?.id]??hole?.whiteTee?.meters;
 const official=Number.isFinite(supplied)&&supplied>0;
 const total=official?supplied:({3:160,4:400,5:500,6:600}[hole?.par]||400);
 const stage=Math.max(0,Math.min(3,Number.isFinite(step)?Math.floor(step):0));
 const progress=[0,.6,.8,1][stage];
 return {total,remaining:total*(1-progress),fromTee:total*progress,progress,official};
}
