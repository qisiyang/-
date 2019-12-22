function inArray(arr, key, val) {

  for (let i = 0; i < arr.length; i++) {

    if (arr[i][key] === val) {

      return i;

    }

  }
  return -1;
}
// ArrayBuffer转16进度字符串
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    })
  return hexArr.join('');
}

Page({
  data: {
    result: '连接结果',
    devices: [],
    connected: false,
    chs: [],
  },
  open: function () {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log(res)//初始化成功
        this.setData({
          result: '初始化成功'
        })

      },
      fail: (err) => {
        console.log(err)
        // 初始化失败
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              console.log('初始化成功')
              this.setData({
                result: '初始化成功'
              })
            }
          })//如果开启蓝牙模块失败了，则对其进行监听，继续开启
        }
      }
    })
  },
  getBluetoothAdapterState(){
     wx.getBluetoothAdapterState({ 
       success: (res) => { 
         console.log('getBluetoothAdapterState', res)        
         if (res.discovering) {
            console.log('蓝牙处于搜索状态')
           this.setData({
             result: '蓝牙处于搜索状态'
           })
            } 
          else if (res.available) { 
            console.log('请搜索附近蓝牙')
           this.setData({
             result :'请搜索附近蓝牙'
           })
            } 
        } 
     }) 
  },
  search: function () {
    var that = this
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        /* 获取蓝牙设备列表 */
        that.onBluetoothDeviceFound()
        console.log(res)
      },
      fail(res) {
      }
    })
  },

  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        }
        else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    var that = this
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId, 
      success: (res) => {
        this.setData({
          connected: true, name, deviceId,
          result: "连接蓝牙设备成功：" 
        })
        this.getBLEDeviceServices(deviceId)
      }
      , fail: (res) =>  {
        that.setData({ result: "连接蓝牙设备失败：" + res.errMsg});
      }
    })
    wx.stopBluetoothDevicesDiscovery()
  },

  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId, success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },

  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId, serviceId, success: (res) => {
        console.log('getBLEDeviceCharacteristics success',
          res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId, serviceId, characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            this.writeBLECharacteristicValue()
            wx.setStorage({
              key: "deviceId",
              data: this._deviceId
            })
            wx.setStorage({
              key: "characteristicId",
              data: this._characteristicId
            })
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId, serviceId, characteristicId: item.uuid, state: true,
            })
          }
        }
      },
      fail(res) { console.error('getBLEDeviceCharacteristics', res) }
    })
    wx.stopBluetoothDevicesDiscovery({
      success(res) {
        console.log(res)
      }
    })
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(
        this.data.chs, 'uuid',
        characteristic.characteristicId
      )
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId, value: ab2hex(characteristic.value)
        }
      }
      else {
      data[`chs[${idx}]`] = {
        uuid: characteristic.characteristicId,
        value: ab2hex(characteristic.value)
      }
      }
      this.setData(data)

    })

  },
  closeBluetoothAdapter() {

    wx.closeBluetoothAdapter()

    this._discoveryStarted = false

  },
  close: function () {
    wx.closeBluetoothAdapter(
    {   success: (res) => {
        console.log(res)
        this.setData({
          result: '关闭成功'
        })
    }})
  },
  stop: function () {
    wx.stopBluetoothDevicesDiscovery({
      success: (res) => {
        console.log(res)
    }})
  }
})
