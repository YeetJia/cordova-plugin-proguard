// adding options from project-custom file in platformpath to default proguard-custom file in pluginpath
let fs = require('fs');
let path = require('path');

module.exports = function (ctx) {
  const projectRoot = ctx.opts.projectRoot;
  const pluginDir = ctx.opts.plugin.dir;
  const targetProguardFile = path.join(pluginDir, 'proguard-custom.txt');
  const projectProguardFile = path.join(projectRoot, 'proguard-custom.txt');
  const POST_CONFIG_TAG = 'CORDOVA PLUGIN PROGUARD';

  try {
    if (fs.existsSync(projectProguardFile)) {
      const data = fs.readFileSync(projectProguardFile, 'utf8');
      fs.appendFileSync(targetProguardFile, data);
      console.log('Added optional proguard-rules to proguardFile.');
    } else {
      console.log('No optional proguard-custom.txt found in projectRoot: ' + projectRoot);
    }
  } catch(err) {
    console.error(err);
  }

  //Root level build.gradle add proguard dependency
  let rootLevelBuildGradlePath = path.resolve(projectRoot, "./platforms/android/build.gradle");
  if (fs.existsSync(rootLevelBuildGradlePath)) {
    let rootBuildGradleContent = fs.readFileSync(rootLevelBuildGradlePath, "utf-8");
    const splitter = 'classpath';
    const proguardClassPath = 'com.guardsquare:proguard-gradle:7.3.+';

    if (rootBuildGradleContent.indexOf(splitter) > -1) {
      if(rootBuildGradleContent.indexOf(proguardClassPath) > -1){
        console.log(`${POST_CONFIG_TAG} - root build.gradle already added proguard dependency`);
      } else {
        let arrContent = rootBuildGradleContent.split(splitter);
        for(let l = arrContent.length; --l >= 0;){
          if(arrContent[l] && typeof arrContent[l] === 'string'){
            let subContent = arrContent[l];
            let arrSubContent = subContent.split(' ');
            if(Array.isArray(arrSubContent) && arrSubContent.length > 1){
              arrSubContent[1]+=`        classpath "${proguardClassPath}"
`
            }
            arrContent[l] = arrSubContent.join(' ');
          }
          break;
        }
      rootBuildGradleContent = arrContent.join(splitter);
    } 
    } else {
      console.log(`${POST_CONFIG_TAG} - root build.gradle  no ${splitter} found`);
    }
    fs.writeFileSync(rootLevelBuildGradlePath, rootBuildGradleContent, "utf-8");
  } else {
    console.log(`${POST_CONFIG_TAG} - '${rootLevelBuildGradlePath}' does not exist. root build.gradle proguard dependency config skipped.`);
  }
};