angular.module('potbot').factory('pbConst', ['lodash','$rootScope', function(_, $rootScope) {


  var matters=[
    {
      name:'THC',
      from:'9',
      to:'12',
      limit:22.117,
      color: '#4FB1A4',
      id:0,
      selected:true,
      title:'Tetrahydrocannabinol (THC)',
      fullDescription:'templates/content/thc.html',
      html:'<strong>Tetrahydrocannabinol (THC)</strong> is the main psychoactive component of cannabis, and is capable of treating a host of different ailments without the help of additional cannabinoids. Patients who suffer from anxiety, depression, PTSD, lack of appetite, pain, inflammation, and cancer have all reported positive results from medicating with THC. In fact, this cannabinoid has proven to be such an effective form of medication that the FDA has approved the development and use of Marinol, a synthetic version of THC, which is now commonly prescribed for patients suffering from chemotherapy treatment and AIDS wasting syndrome.',
    },
    {
      name:'CBD',
      from:'9',
      to:'12',
      limit:9,
      color: '#74B65F',
      id:1,
      title:'Cannabidiol (CBD)',
      fullDescription:'templates/content/cbd.html',
      html:'<strong>Cannabidiol (CBD)</strong>  is a non-psychoactive cannabinoid that works as a stimulant to increase focus and boost productivity. Despite its tendency to raise energy levels, CBD helps regulate any potentially overwhelming effects that could be brought on by THC. In addition, CBD has proven to reduce inflammation by activating CB2 receptors located throughout the body. For patients who would prefer to avoid the psychoactive effects of THC, CBD alone has proven to be an effective treatment for a number of different ailments, including but not limited to: PTSD, ADD, ADHD,  inflammation, chronic fatigue, cancer, anxiety, nausea, seizures, and general pain.',
    },
    {
      id:2,
      name:'CBN',
      from:'9',
      to:'12',
      limit:0.373,
      color: '#80CC28',
      title:'Cannabinol (CBN)',
      fullDescription:'templates/content/cbn.html',
      html:'<strong>Cannabinol (CBN)</strong>  is the primary product of THC degradation, and there are usually only trace amounts of it in a fresh plant. CBN content increases as THC degrades from exposure to light and air. Cannabis plants that are high in CBN have strong sedative effects, and as a result, are popularly used as a natural sleep aid.  Not only has CBN proven to help patients fall asleep, it has also been proven to increase appetite, reduce inflammation, alleviate pain, and when used as a topical, kill bacteria. It is common for indica strains to have a higher CBN content than sativa strains.',
    },
    {
      id:3,
      name:'CBC',
      from:'9',
      to:'12',
      limit:0.4,
      color: '#C3D651',
      title:'Cannabichromene (CBC)',
      fullDescription:'templates/content/cbc.html',
      html:'<strong>Cannabichromene (CBC)</strong>  is non-psychoactive cannabinoid that, despite not getting the attention it deserves, possesses a number of medicinal qualities that make it an important part of the plant’s cannabinoid profile. CBC is a synergistic cannabinoid, meaning its presence enhances the therapeutic value of marijuana’s other key cannabinoids. When effectively combined with other cannabinoids such as THC and CBD, CBC can help relieve pain, reduce inflammation, kill bacteria, and even promote neurogenesis.',
    },
    {
      id:4,
      name:'THCV',
      from:'9',
      to:'12',
      limit:0.03,
      color: '#4FB1A4',
      title:'Tetrahydrocannabivarin (THCV)',
      fullDescription:'templates/content/thcv.html',
      html:'<strong>Tetrahydrocannabivarin (THCV)</strong>  is a psychoactive cannabinoid that strengthens the effects of THC. Known for its energetic and clear-headed effects, THCV enables patients to be up and active throughout the day. Because THCV hastens the overall psychoactive effects, strains high in THCV are great for patients who need instant relief without the need to be medicated for long periods of time.  In addition to being an effective appetite suppressant for those with eating disorders, THCV has also shown to stimulate bone growth and reduce seizures.',
    },
    {
      id:5,
      name:'CBG',
      from:'9',
      to:'12',
      limit:0.398,
      color: '#6CA9E0',
      title:'Cannabigerol (CBG)',
      fullDescription:'templates/content/cbg.html',
      html:'<strong>Cannabigerol (CBG)</strong> is considered a “building block” cannabinoid, meaning that, even though CBG is capable of standing on its own, it usually breaks down further to create one of the following three cannabinoids: THC, CBD, and CBC. However, some breeders have chosen to develop strains that inhibit the breakdown of CBG in order to to take advantage of its unique set of medicinal qualities - including its ability to reduce ocular pressure, anxiety, and inflammation, as well as inhibit tumor growth. As time goes on, expect to start seeing growers place a greater emphasis on CBG content.',

    }
  ];


  return {
    cookieName:'pbSavedUser_v2',
    cannabisExperienceLabels:[
      {id:0, val:0, label:'Never', desc:'I have never medicated with cannabis'},
      {id:1, val:0.2, label:'Rarely', desc:'I have medicated with cannabis a handful of times'},
      {id:2, val:0.4, label:'Moderate', desc:'I medicate with cannabis once or twice per month'},
      {id:3, val:0.6, label:'Often', desc:'I medicate with cannabis once or twice per week'},
      {id:4, val:0.8, label:'Daily', desc:'I medicate with cannabis on a daily basis'}
    ],
    typeColors:{
      'SD':'#60b84f',
      'ID':'#a646b9',
      'H':'#4659b9',
      'S':'#60b84f',
      'I':'#a646b9'
    },




    matters:matters,

    takeFromMatters:function(label){
      return _.map(matters,function(item){
        return item[label];
      });
    }
};


}]);
