import fs from 'fs';


// Must perform the same conversion as stripes-cli/lib/cli/generate-module-descriptor.js
function package2md(packageJson, isStrict) {
  const stripes = packageJson.stripes || {};
  const moduleDescriptor = {
    id: `${packageJson.name.replace(/^@/, '').replace('/', '_')}-${packageJson.version}`,
    name: packageJson.description,
    permissionSets: stripes.permissionSets || [],
  };
  if (isStrict) {
    const interfaces = stripes.okapiInterfaces || [];
    moduleDescriptor.requires = Object.keys(interfaces).map(key => ({ id: key, version: interfaces[key] }));
    const optional = stripes.optionalOkapiInterfaces || [];
    moduleDescriptor.optional = Object.keys(optional).map(key => ({ id: key, version: optional[key] }));
  }
  return moduleDescriptor;
}


class FolioModuleDescriptor {
  constructor(type, filename) {
    if (type !== 'md' && type !== 'package') {
      throw new Error(`FolioModuleDescriptor: bad type "${type}" (should be "md" or "package")`);
    }

    this.type = type;
    this.filename = filename;
    this.text = fs.readFileSync(filename, { encoding: 'utf-8' });
    const json = JSON.parse(this.text);
    if (type === 'md') {
      this.json = json;
    } else {
      this.json = package2md(json, true);
    }
    this.name = this.json.id.replace(/(.*)-.*/, '$1');
    this.id = this.json.id.replace(/.*-/, '');
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  getFullId() {
    return this.json.id;
  }
}


export default FolioModuleDescriptor;