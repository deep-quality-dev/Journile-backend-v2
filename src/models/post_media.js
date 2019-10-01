/* @flow */

import fileUploader from '../middleware/uploader';

const postMedia = (sequelize: any, DataTypes: any) => {
  const PostMedia = sequelize.define('post_media', {
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        isNumeric: true
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    thumb: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      validate: {
        isNumeric: true
      },
    },
    create_date: DataTypes.DATE,
    update_date: DataTypes.DATE,
  }, {
    timestamps: false,
  });

  PostMedia.uploadMedia = async function (post_id: number, type: number, urls: Array<any>, transaction: any) {
    if(!urls || urls.length < 1) throw new Error ('Parameter \'urls\' is missed')
    
    let insertData = [], filePath: string = '', thumbUrl: ?string = null;

    try {
      for(let i = 0; i < urls.length; i++) {
        filePath = '';
        thumbUrl = null;
        if (type == 0) {
          filePath = await fileUploader.uploadImageFromUrl(urls[i]);
        } else {
          filePath = urls[i].url;
          if (urls[i].thumb_url) {
            thumbUrl = await fileUploader.uploadImageFromUrl(urls[i].thumb_url);
          }
        }
        insertData.push ({ post_id, type, url: filePath, thumb: thumbUrl });
      }
      const option = transaction? { transaction } : {}
      await PostMedia.bulkCreate(insertData, option)
    }
    catch(err){
      throw err;
    }
  }

  return PostMedia;
};

export default postMedia;