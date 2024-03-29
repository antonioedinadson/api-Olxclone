const { v4: uuidv4 } = require("uuid");
const jimp = require("jimp");

const Category = require("../models/Category");
const User = require("../models/User");
const Ad = require("../models/Ad");
const State = require("../models/State");
const { update } = require("../models/Category");

const addImage = async (buffer) => {
  let newName = `${uuidv4()}.jpg`;
  let tmpImg = await jimp.read(buffer);
  tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
  return newName;
};

module.exports = {
  getCategories: async (req, res) => {
    const categories = await Category.find();

    let category = [];

    for (let i in categories) {
      category.push({
        ...categories[i]._doc,
        img: `${process.env.BASE}/assets/images/${categories[i].slug}.png`,
      });
    }

    res.json({ category: category });
  },

  getList: async (req, res) => {
    let total = 0;

    let {
      sort = "asc",
      offset = 0,
      limit = 8,
      query,
      category,
      state,
    } = req.query;

    let filters = { status: true };

    if (query) {
      filters.title = { $regex: query, $options: "i" };
    }

    if (category) {
      const c = await Category.findOne({ slug: category }).exec();

      if (c) {
        filters.category = c._id.toString();
      }
    }

    if (state) {
      const s = await State.findOne({ name: state.toUpperCase() }).exec();
      if (s) {
        filters.state = s._id.toString();
      }
    }

    const adsTotal = await Ad.find(filters).exec();
    total = adsTotal.length;

    const adsData = await Ad.find(filters)
      .sort({ create_at: sort == "desc" ? -1 : 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .exec();

    let ads = [];

    for (let i in adsData) {
      let image;
      let imageDefault = adsData[i].image.find((e) => e.default == true);

      if (imageDefault) {
        image = `${process.env.BASE}/media/${imageDefault.url}`;
      } else {
        image = `${process.env.BASE}/media/default.jpg`;
      }

      ads.push({
        id: adsData[i]._id,
        title: adsData[i].title,
        price: adsData[i].price,
        priceNegotiable: adsData[i].priceNegotiable,
        image: image,
      });
    }

    res.json({ ads: ads, total: total });
  },

  addAction: async (req, res) => {
    let { title, price, priceneg, desc, cat, token } = req.body;

    const user = await User.findOne({ token }).exec();

    if (!title || !cat) {
      res.json({ error: "Titulo e/ou categoria não foram enviados" });
      return;
    }

    if(cat.length < 12) {
      res.json({ error: "Categoria Inexistente"});
      return;
    }

    const category = await Category.findById(cat);
    if(!category) {
      res.json({ error: "Categoria Inexistente"});
      return;
    }


    if (price) {
      price = price.replace(".", "").replace(",", ".").replace("R$", "");
      price = parseFloat(price);
    } else {
      price = 0;
    }

    const newAd = new Ad();
    newAd.status = true;
    newAd.idUser = user._id;
    newAd.state = user.state;
    newAd.title = title;
    newAd.category = cat;
    newAd.price = price;
    newAd.priceNegotiable = priceneg == "true" ? true : false;
    newAd.description = desc;
    newAd.views = 0;
    newAd.create_at = new Date();

    if (req.files && req.files.img) {
      if (req.files.img.length == undefined) {
        console.log("SEND ONE IMAGES");

        if (
          ["image/jpeg", "image/jpg", "image/png"].includes(
            req.files.img.mimetype
          )
        ) {
          let url = await addImage(req.files.img.data);

          newAd.image.push({
            url: url,
            default: false,
          });
        }
      } else {
        console.log("SEND MULTIPLE IMAGES");

        for (let i = 0; i < req.files.img.length; i++) {
          if (
            ["image/jpeg", "image/jpg", "image/png"].includes(
              req.files.img[i].mimetype
            )
          ) {
            let url = await addImage(req.files.img[i].data);

            newAd.image.push({
              url: url,
              default: false,
            });
          }
        }
      }
    }

    if (newAd.image.length > 0) {
      newAd.image[0].default = true;
    }

    const info = await newAd.save();
    res.json({ id: info._id });
  },

  getItem: async (req, res) => {
    let { id, other = null } = req.query;

    if (!id) {
      res.json({ error: "Sem Produto" });
      return;
    }

    if (id.length < 12) {
      res.json({ error: "ID INVALIDO" });
      return;
    }

    const ad = await Ad.findById(id);

    if (!ad) {
      res.json({ error: "Produto não encontrado" });
      return;
    }

    let images = [];

    for (let i in ad.images) {
      images.push(`${process.env.BASE}/media/${ad.images[i].url}`);
    }

    // ADICIONANDDO VISUALIZAÇÕES
    ad.views++;
    await ad.save();

    let userInfo = await User.findById(ad.idUser).exec();
    // let category = await Category.findById(ad.category).exec();
    let stateInfo = await State.findById(ad.state).exec();

    let others = [];


    if(other) {

      const otherData = await User.find({status: true, idUser: ad.idUser}).exec();

      for(let i in otherData) {

        if(otherData[i]._id.toString() != ad._id.toString()) {
          
          let image = `${process.env.BASE}/media/default.jpg`;

          let defaultImage = otherData[i].images.find(e => e.default);

          if(defaultImage) {
            image = `${process.env.BASE}/media/${defaultImage.url}`;
          }

          other.push({
            id: otherDate[i]._id,
            title: otherDate[i].title,
            price: otherDate[i].price,
            priceNegotiable: otherDate[i].priceNegotiable,
            image
          });

        }
        
      }      

    }

    res.json({
      id: ad._id,
      title: ad.title,
      price: ad.price,
      priceNegotiable: ad.priceNegotiable,
      description: ad.description,
      views: ad.views,
      create_at: ad.create_at,
      images: images,
      
      userInfo: { 
        name: userInfo.name, 
        email: userInfo.email 
      },

      // category: category,
      stateName: stateInfo.name,
      others
    });
  },

  editAction: async (req, res) => {

    let { id } = req.params;
    let { title, status, price, priceneg, desc, cat, image, token } = req.body;

    if(id.length < 12) {
      res.json({error: "ID INVALIDO"});
      return;
    }

    const ad = await Ad.findById(id).exec();

    if(!ad) {
      res.json({error: "ANUNCIO INESISTENTE"});
      return;
    }


    const user = await User.findOne({token: token}).exec();

    if(user._id.toString() !== ad.idUser) {
      res.json({error: "ESSE ANUNCIO NÃO É SEU!"});
      return;
    }

    let updates = {};

    if(title) {
      updates.title = title;
    }

    if (price) {
      price = price.replace(".", "").replace(",", ".").replace("R$", "");
      price = parseFloat(price);
      updates.price = price
    }
  
    if(priceneg) {
      updates.priceNegotiable = priceneg;
    }
  
    if(status) {
      updates.status = status;
    }
  
    if(desc) {
      updates.desc = desc;
    }
  
  
    if(cat) {
  
      const category = await Category.findOne({slug: cat}).exec();
  
      if(!category) {
        res.json("CATEGORIA INESISTENTE");
      }
  
      updates.category = category._id.toString();
  
    }
    
    await Ad.findByIdAndUpdate(id, {$set: updates});
    
    if(req.files && req.files.img) {
      const adI = await Ad.findById(id);

      if(req.files.img.length == undefined) {
          if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
              let url = await addImage(req.files.img.data);
              adI.image.push({
                  url,
                  default: false
              });
          }
      } else {
          for(let i=0; i < req.files.img.length; i++) {
              if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                  let url = await addImage(req.files.img[i].data);
                  adI.image.push({
                      url,
                      default: false
                  });
              }
          }
      }

      adI.images = [...adI.image];
      await adI.save();
  }
    
    res.json({error: ''});
  },
};
