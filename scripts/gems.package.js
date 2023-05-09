const PACKAGES = {};

export const loadPackage = async (packageId) => {
  let pack = await fetch(`packages/${packageId}.json`).then(res => res.json());

  PACKAGES[packageId] = Object.assign({}, pack);

  return pack;
};

export const getPackage = (packageId) => {
  let pack = PACKAGES[packageId];

  if (pack == null) {
    return null;
  }

  return Object.assign({}, pack);
};
