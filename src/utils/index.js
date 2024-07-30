const cleanObject = (obj) => {
  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    } else if (Array.isArray(obj[key])) {
      !obj[key].length && delete obj[key];
    } else {
      if (typeof obj[key] === "object") {
        cleanObject(obj[key]);
      }
    }
  }

  return obj;
};

const regexImage = /\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i;

const filterProducts = (initial = { is_deleted: false }, action) => {
  switch (action.type) {
    case "search": {
      return {
        ...initial,
        product_name: {
          $regex: action.payload,
          $options: "i",
        },
      };
    }
    case "cate_id": {
      return {
        ...initial,
        category_id: action.payload,
      };
    }
    case "sale_off": {
      return {
        ...initial,
        saleOff: { $ne: 0 },
      };
    }
    default: initial
  }
};

module.exports = {
  cleanObject,
  regexImage,
  filterProducts
};
