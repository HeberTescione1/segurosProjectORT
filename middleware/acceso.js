const acceso = (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  req.isAndroid = /android/i.test(userAgent);
  req.isWeb = !req.isAndroid;

  next();
};

export default acceso;
