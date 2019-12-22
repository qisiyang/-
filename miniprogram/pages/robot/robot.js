
Page({
  data: {
    deviceId: wx.getStorageSync('deviceId'),
    serviceId: wx.getStorageSync('deviceId'),
    characteristicId: wx.getStorageSync('characteristicId')


  },
  goforward: function () { //写入前进命令
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicId,
      value: that.getBinaryData("ONA")
    });
  },
  turnleft: function () { //写入左转命令
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicId,
      value: that.getBinaryData("ONC")
    });
  },
  turnright: function () { //写入右转命令
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicId,
      value: that.getBinaryData("OND")
    });
  },
  goback: function () { //写入后退命令
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicId,
      value: that.getBinaryData("ONB")
    });
  },
  stopend: function () { //写入停止命令
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicId,
      value: that.getBinaryData("ONF")
    });
  },
  getBinaryData: function (message) { //将数据转为二进制数组
    let buffer = new ArrayBuffer(6);
    let dataView = new DataView(buffer);
    var numTitle = 0;
    for (var i = 0; i < message.length; i = i + 2) {
      var numStr16 = message.substr(i, 2);
      var num = parseInt(numStr16, 16);
      dataView.setUint8(numTitle, num);
      numTitle++;
    }
    return buffer;
  }
})