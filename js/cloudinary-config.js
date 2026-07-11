/* ==============================================
   CLOUDINARY HERO VIDEO CONFIG
   ----------------------------------------------
   1. Upload video1–3 + video5 to your Cloudinary
      Media Library (e.g. folder: wealthspring/hero)
   2. Set cloudName to your Cloudinary cloud name
   3. Match each publicId to the asset Public ID
      (folder path + filename, no file extension)
   ============================================== */

window.WEALTHSPRING_CLOUDINARY = {
  /* Required: Dashboard → Account Details → Cloud name */
  cloudName: 'dvx7akvw6',

  /* Delivery transforms — optimized for hero backgrounds */
  videoTransform: 'f_auto,q_auto:eco,w_1600,c_limit,vc_auto',
  posterTransform: 'so_0,w_1600,c_fill,g_auto,q_auto,f_auto',

  /* Hero slides — order matches the <video> tags / indicators */
  videos: [
    {
      publicId: 'wealthspring/hero/video1',
      duration: 15
    },
    {
      publicId: 'wealthspring/hero/video2',
      duration: 15
    },
    {
      publicId: 'wealthspring/hero/video3',
      duration: 15
    },
    {
      publicId: 'wealthspring/hero/video5',
      duration: 15
    }
  ]
};

/**
 * Build a Cloudinary video delivery URL.
 * @param {string} publicId
 * @param {string} [transform]
 * @returns {string}
 */
window.cldVideoUrl = function cldVideoUrl(publicId, transform) {
  var cfg = window.WEALTHSPRING_CLOUDINARY || {};
  var cloud = cfg.cloudName || 'demo';
  var t = transform != null ? transform : (cfg.videoTransform || 'f_auto,q_auto');
  var path = t ? t + '/' + publicId : publicId;
  return 'https://res.cloudinary.com/' + cloud + '/video/upload/' + path;
};

/**
 * Poster frame from the video (first frame / so_0).
 * @param {string} publicId
 * @returns {string}
 */
window.cldPosterUrl = function cldPosterUrl(publicId) {
  var cfg = window.WEALTHSPRING_CLOUDINARY || {};
  var cloud = cfg.cloudName || 'demo';
  var t = cfg.posterTransform || 'so_0,w_1600,c_fill,q_auto,f_auto';
  return 'https://res.cloudinary.com/' + cloud + '/video/upload/' + t + '/' + publicId + '.jpg';
};
