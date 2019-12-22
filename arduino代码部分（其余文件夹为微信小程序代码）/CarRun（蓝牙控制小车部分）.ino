/*前进  按下发出 ONA  松开ONF
  后退：按下发出 ONB  松开ONF
  左转：按下发出 ONC  松开ONF
  右转：按下发出 OND  松开ONF
  停止：按下发出 ONE  松开ONF
  
  蓝牙程序功能是按下对应的按键执行操，松开按键就停止
*/
char getstr; 
int Left_motor_go=8;     //左电机前进(IN1)
int Left_motor_back=9;     //左电机后退(IN2)
int Right_motor_go=10;    // 右电机前进(IN3)
int Right_motor_back=11;    // 右电机后退(IN4)

const int SensorRight_2 = 5;   	//左边红外避障传感器()
const int SensorLeft_2 = 6;   	//右边红外避障传感器()
int SR_2;    //右边红外避障传感器状态
int SL_2;    //左边红外避障传感器状态

int beep=A3;//定义蜂鸣器 数字A3 接口

int  flag_bz ;
void setup()
{
  //初始化电机驱动IO为输出方式
   Serial.begin(9600);
  pinMode(Left_motor_go,OUTPUT); // PIN 8 (无PWM)
  pinMode(Left_motor_back,OUTPUT); // PIN 9 (PWM)
  pinMode(Right_motor_go,OUTPUT);// PIN 10 (PWM) 
  pinMode(Right_motor_back,OUTPUT);// PIN 11 (PWM)
  pinMode(beep,OUTPUT);//定义蜂鸣器为输出接口
  pinMode(SensorRight_2, INPUT); //定义中间避障传感器为输入
  pinMode(SensorLeft_2, INPUT); //定义中间避障传感器为输入
}
void run()
{
  digitalWrite(Right_motor_go,HIGH);  // 右电机前进
  digitalWrite(Right_motor_back,LOW);     
 //analogWrite(Right_motor_go,150);//PWM比例0~255调速，左右轮差异略增减
  //analogWrite(Right_motor_back,0);
  digitalWrite(Left_motor_go,LOW);  // 左电机前进
  digitalWrite(Left_motor_back,HIGH);
  //analogWrite(Left_motor_go,0);//PWM比例0~255调速，左右轮差异略增减
  //analogWrite(Left_motor_back,150);
  //delay(time * 100);   //执行时间，可以调整  
}

void brake()         //刹车，停车
{
  digitalWrite(Right_motor_go,LOW);
  digitalWrite(Right_motor_back,LOW);
  digitalWrite(Left_motor_go,LOW);
  digitalWrite(Left_motor_back,LOW);
  
}

void left()
{
  digitalWrite(Right_motor_go,HIGH);	// 右电机前进
  digitalWrite(Right_motor_back,LOW);
  //analogWrite(Right_motor_go,150); 
  //analogWrite(Right_motor_back,0);//PWM比例0~255调速
  digitalWrite(Left_motor_go,LOW);   //左轮后退
  digitalWrite(Left_motor_back,LOW);
  //analogWrite(Left_motor_go,0); 
  //analogWrite(Left_motor_back,0);//PWM比例0~255调速
  //delay(time * 100);	//执行时间，可以调整  
}

void spin_left(int time)         //左转(左轮后退，右轮前进)
{
  digitalWrite(Right_motor_go,HIGH);	// 右电机前进
  digitalWrite(Right_motor_back,LOW);
  //analogWrite(Right_motor_go,200); 
  //analogWrite(Right_motor_back,0);//PWM比例0~255调速
  digitalWrite(Left_motor_go,HIGH);   //左轮后退
  digitalWrite(Left_motor_back,LOW);
  //analogWrite(Left_motor_go,200); 
  //analogWrite(Left_motor_back,0);//PWM比例0~255调速
  //delay(time * 100);	//执行时间，可以调整  
}
void right()
{
  digitalWrite(Right_motor_go,LOW);   //右电机后退
  digitalWrite(Right_motor_back,LOW);
  //analogWrite(Right_motor_go,0); 
 // analogWrite(Right_motor_back,0);//PWM比例0~255调速
  digitalWrite(Left_motor_go,LOW);//左电机前进
  digitalWrite(Left_motor_back,HIGH);
  //analogWrite(Left_motor_go,0); 
  //analogWrite(Left_motor_back,150);//PWM比例0~255调速
  //delay(time * 100);	//执行时间，可以调整  
}

void spin_right()        //右转(右轮后退，左轮前进)
{
  digitalWrite(Right_motor_go,LOW);   //右电机后退
  digitalWrite(Right_motor_back,HIGH);
  //analogWrite(Right_motor_go,0); 
 // analogWrite(Right_motor_back,200);//PWM比例0~255调速
  digitalWrite(Left_motor_go,LOW);//左电机前进
  digitalWrite(Left_motor_back,HIGH);
 // analogWrite(Left_motor_go,0); 
 // analogWrite(Left_motor_back,200);//PWM比例0~255调速
  //delay(time * 100);	//执行时间，可以调整    
}
void back()
{
  digitalWrite(Right_motor_go,LOW);  //右轮后退
  digitalWrite(Right_motor_back,HIGH);
 // analogWrite(Right_motor_go,0);
 // analogWrite(Right_motor_back,150);//PWM比例0~255调速
  digitalWrite(Left_motor_go,HIGH);  //左轮后退
  digitalWrite(Left_motor_back,LOW);
  //analogWrite(Left_motor_go,150);
  //analogWrite(Left_motor_back,0);//PWM比例0~255调速
  //delay(time * 100);     //执行时间，可以调整  
}
void loop()
{
  getstr=Serial.read(); // 
  if(flag_bz == 1)//切换到壁障模式
  {
      //有信号为LOW  没有信号为HIGH
    SR_2 = digitalRead(SensorRight_2);
    SL_2 = digitalRead(SensorLeft_2);
    if (SL_2 == HIGH&&SR_2==HIGH)
      {
        run();   //调用前进函数
         digitalWrite(beep,LOW);
      }
    else if (SL_2 == HIGH & SR_2 == LOW)// 右边探测到有障碍物，有信号返回，向左转 
        left();
    else if (SR_2 == HIGH & SL_2 == LOW) //左边探测到有障碍物，有信号返回，向右转  
      spin_right();
    else // 都是有障碍物, 后退
    {
        digitalWrite(beep,HIGH);		//蜂鸣器响
         //digitalWrite(LED,HIGH);		//LED亮
         brake();//停止200MS
         delay(300);
         back();//后退500MS
         delay(400);
         left();//调用左转函数  延时500ms 
         delay(500); 
    }
  
  }
  if(getstr=='A') 
  { 
    Serial.println("go forward!"); 
    run();
    flag_bz = 1;
  } 
  else if(getstr=='B'){ 
    Serial.println("go back!"); 
    back(); 
    flag_bz = 0;
  } 
  else if(getstr=='C'){ 
    Serial.println("go left!"); 
    left();
     flag_bz = 0;
  } 
  else if(getstr=='D'){ 
    Serial.println("go right!"); 
     right();
     flag_bz = 0;
     
  } 
   else if(getstr=='F'){ 
    Serial.println("Stop!"); 
     brake(); 
     flag_bz = 0; 
     
  } 
   else if(getstr=='E'){ 
    Serial.println("Stop!"); 
    brake();
    flag_bz = 0;  
  } 
}


