const 랜덤=(min,max)=>Math.floor(Math.random()*(max-min+1)+min),
endcode={'<.>':'.','<?>':'?','<!>':'!'},
letterbox={
  word:{},
  변환(s){
    let r=[];
    while(s){
      let p="",w=this.word,i=0;
      if(/[^\s,."'?!]/.test(s[i]))
      while(Object.keys(w).length){
        if(w[s[i]]){
          w=w[s[i]];
          p+=s[i];
          ++i
        }else{
          if(!s[i])break
          if(/[\s,."'?!]/.test(s[i])){
            if(w[""])break;
            let key=Object.keys(w)
            w=w[key[0]];
            p+=key;
          }else{
            let buf_j="",buf_same=0;
            for(const j in w){
              if(w[j][s[i+1]]){
                let a=korE(j),b=korE(s[i]),
                same=(a[0]==b[0])*3+(a[1]==b[1])*2+(a[2]==b[2]);
                if(same>=buf_same){
                  buf_j=j;
                  buf_same=same;
                }
              }
            }
            if(buf_j){
              w=w[buf_j][s[++i]];
              p+=buf_j+s[i];
              ++i
            }else{buf_j="";buf_same=0
              for(const j in w){
                let a=korE(j),b=korE(s[i]),
                same=(a[0]==b[0])*3+(a[1]==b[1])*2+(a[2]==b[2]);
                if(same>=buf_same){
                  buf_j=j;
                  buf_same=same;
                }
              }
              if(w[""]&&buf_same<4)break;
              w=w[buf_j];
              p+=buf_j;
              ++i
            }
          }
        }
      }
      if(p=="")s=s.substring(1)
      else{
        s=s.substring(p.length)
        r.push(p);
      }
    }
    return r
  },
  add(word){
    let i=0,w=this.word;
    while(word[i]){
      if(!w[word[i]])w[word[i]]={}
      w=w[word[i]]
      ++i
    }
    w[""]=1;
  }
},
chat={
  fw:{},fw_max:{},
  nw:{},nw_max:{},
  pw:{},pw_max:{},
  ct:{},ct_max:{},
  before_txt:[],
  학습(i,o){
    o=strCut(o);
    letterbox.변환(i).map($=>{
      if(!this.fw[$])this.fw[$]={};
      if(!this.fw[$][o[0]])this.fw[$][o[0]]=0;
      this.fw[$][o[0]]++;
      if(this.fw_max[$]==undefined||this.fw_max[$]<this.fw[$][o[0]])this.fw_max[$]=this.fw[$][o[0]];

      if(!this.pw[$])this.pw[$]={};
      o.map(_=>{
        if(!this.pw[$][_])this.pw[$][_]=0;
        this.pw[$][_]++;
        if(this.pw_max[$]==undefined||this.pw_max[$]<this.pw[$][o[0]])this.pw_max[$]=this.pw[$][o[0]];
      })
    })
    let buf_txt="";
    o.map($=>{
      if(buf_txt){
        if(!this.nw[buf_txt])this.nw[buf_txt]={};
        if(!this.nw[buf_txt][$])this.nw[buf_txt][$]=0;
        this.nw[buf_txt][$]++;
        if(this.nw_max[$]==undefined||this.nw_max[$]<this.nw[buf_txt][$])this.nw_max[$]=this.nw[buf_txt][$];
      }
      buf_txt=$;
    });
  },
  맥락학습(arr){
    let buf=[];
    arr.map($=>{
      this.학습($[0],$[1])
      let out=strCut($[1])
      console.log(out);
      if(buf[0])
      letterbox.변환(buf[0]).map($=>{
        if(!this.ct[$])this.ct[$]={};
        out.map(_=>{
          if(!this.ct[$][_])this.ct[$][_]=0;
          this.ct[$][_]++;
          if(this.ct_max[$]==undefined||this.ct_max[$]<this.ct[$][_])this.ct_max[$]=this.ct[$][_];
        })
        
      })
      buf=$
    })
  },
  대답(s){
    s=letterbox.변환(s);
    let fw={},pw={};
    s.map($=>{
      if(this.fw[$])
      Object.keys(this.fw[$]).map(_=>{
        if(!fw[_])fw[_]=0
        fw[_]+=this.fw[$][_]/this.fw_max[$]
      })
      if(this.pw[$])
      Object.keys(this.pw[$]).map(_=>{
        if(!pw[_])pw[_]=0
        pw[_]+=this.pw[$][_]/this.pw_max[$]
      })
      
    })
    this.before_txt.map($=>{
      if(this.ct[$])
      Object.keys(this.ct[$]).map(_=>{
        if(!pw[_])pw[_]=0
        pw[_]+=this.ct[$][_]/this.ct_max[$]*.5
      })
    })
    let fw_max=["",0]
    Object.keys(fw).map($=>{
      if(fw_max[1]<fw[$])fw_max=[$,fw[$]]
    })
    let bw=fw_max[0],r="",i=0;
    while(!/<[.?!]>/.test(bw)&&i<100){++i
      let nw={},words=this.nw[bw],nw_max=this.nw_max[bw]||1;
      for(const i in words){
        if(pw[i])nw[i]=words[i]/nw_max*1.1+pw[i];
      }
      let buf=["",0];
      for(const i in nw){
        if(buf[1]<nw[i])buf=[i,nw[i]];
      }
      console.log(pw[buf[0]]*=.7);
      if(/[.?!]/.test(buf[0]))r+=bw
      else r+=bw+" ";
      bw=buf[0]
    }
    r+=endcode[bw]
    console.log(pw);
    this.before_txt=s
    return r;
  }
};
letterbox.word={나:{},너:{},넌:{},닌:{},줘:{},불:{},꺼:{줘:{}},누:{구:{}},이:{름:{}},엄:{마:{}},게:{임:{}},선:{생:{님:{}}},밀:{레:{니:{엄:{}}}},키:{보:{토:{스:{}}}},모:{모:{이:{}},르:{다:{}},험:{}},미:{도:{리:{}}},유:{우:{카:{}}},속:{성:{}},딜:{러:{}},던:{전:{}},아:{리:{스:{}},마:{}},하:{다:{}},무:{슨:{}},싶:{다:{}},오:{늘:{}},주:{다:{}},생:{각:{}},괜:{찮:{다:{}}},그:{렇:{다:{}}},문:{제:{}},없:{다:{}},어:{떤:{}},먹:{다:{}},축:{하:{}},밥:{},레:{벨:{}},여:{기:{}},역:{할:{}},자:{다:{}},천:{장:{}},추:{천:{}},낯:{선:{}},뭘:{},쨩:{},야:{},업:{},곳:{},"?":{}}
letterbox.add("찾다")
letterbox.add("가")
letterbox.add("는")
letterbox.add("어디")
letterbox.add("싸움")
letterbox.add("하자")
letterbox.add("잘")
letterbox.add("건전지")
letterbox.add("배터리")
letterbox.add("기름")
letterbox.add("안녕")
letterbox.add("놀다")
letterbox.add("맛")
letterbox.add("있다")
letterbox.add("를")
letterbox.add("봄")
letterbox.add("여름")
letterbox.add("가을")
letterbox.add("아니")
letterbox.add("저")
letterbox.add("그")
letterbox.add("광역")
letterbox.add("명")
letterbox.add("그게")
letterbox.add("잖아")
letterbox.add("피자")
letterbox.add("모자")
letterbox.add("모자이크")
letterbox.add("아이스크림")
letterbox.add("햄버거")
letterbox.add("겨울")
letterbox.add("자다")

function strCut(s){
  let arr=[]
  while(s){
    let match;
    match=s.match(/^[\s,"'?!]/)||s.match(/^\.+/)||s.match(/^[^\s,."'?!]*/);
    if(!/\s/.test(match[0]))arr.push(match[0])
    s=s.substring(match[0].length);
  }
  console.log(/^[.?!]/.test(arr[arr.length-1]));
  if(/^[.?!]/.test(arr[arr.length-1]))arr[arr.length-1]=arr[arr.length-1].replace(/^[.?!]/,"<$&>")
  else arr.push('<.>')
  return arr
}

function korE(kor) {
  const f=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],
  s=['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'],
  t=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  let uni=kor.charCodeAt(0)-44032,
  fn=parseInt(uni/588);
  return[
    f[fn],
    s[(uni-(fn*588))/28|0],
    t[uni%28|0]
  ];
}

chat.학습("넌 누구니?","저는 용사 아리스! 명속성 광역 딜러 입니다!")
chat.학습("아리스 너의 역할은 뭐야","저의 역할은 명속성 광역 딜러 입니다!")
chat.학습("안녕","안녕하세요 선생님!")
chat.학습("안녕 아리스","안녕하세요 선생님!")
chat.학습("아리스","무엇입니까 선생님?")
chat.학습("놀자 아리스","선생님도 같이 게임 하실래요?")
chat.학습("잘자","선새니 부꺼조")
chat.학습("아리스 넌 무얼 하고 싶어?","저는 게임이 하고 싶습니다 모모이가 새로나온 게임이라고 소개해준 게임이 있습니다!")
chat.학습("아리스 뭐해?","저는 선생님과 대화하고 있습니다! 선생님의 호감도를 올려서 선생님을 공략하고 메모리얼 일러스트를 해금할 것 입니다!")
chat.학습("아리스 뭐해?","저는 선생님과의 미연시를 하고 있습니다! 선생님의 호감도를 올려서 이벤트 일러스트를 해금할 것 입니다!")
chat.학습("아리스 지금 뭐해?","저는 선생님과 대화하고 있습니다! 선생님의 호감도를 올려서 선생님을 공략하고 메모리얼 일러스트를 해금할 것 입니다!")
chat.학습("뭐할래?","아리스는 게임을 할것 입니다")
chat.학습("뭐할래?","아리스는 밥을 먹을 것 입니다")
chat.학습("아리스 오늘 뭘 할꺼야?","오늘도 모험을 나갈 것입니다. 매일 모험을 하며 레벨업을 하면 전에 해보지못한 것들을 해볼 수 있습니다!")
chat.학습("매일 매일 성장하고 있어!","선생님도 열심히 해주세요, 그런 레벨로 괜찮은건가요?")
chat.학습("괜찮아, 문제없어.... 라고 생각해 아마","그럼 오늘도 모험을 나가요, 선생님도 같이 와 주지 않으실래요?")
chat.학습("아리스 밥먹자","아리스는 피자가 먹고 싶습니다!")
chat.학습("아리스 밥 먹을래?","아리스는 피자가 먹고 싶습니다!")
chat.학습("아리스 밥이나 먹자","아리스는 햄버거가 먹고 싶습니다!")
chat.학습("아리스 밥 먹을래?","아리스는 햄버거가 먹고 싶습니다!")
chat.학습("밥이나 먹자","아리스는 피자가 먹고 싶습니다!")
chat.학습("아리스 밥이나 먹자","아리스는 피자가 먹고 싶습니다!")
chat.학습("축하해! 레벨업","선생님도 노력하셔야 합니다. 지금 레벨에 잠이 옵니까?")
chat.학습("뭐 먹을래","아리스는 커피가 먹고 싶습니다.")
chat.학습("건전지 먹을래?","아리스는 건전지를 먹지 않습니다!")
chat.학습("배터리 먹어","아리스는 건전지를 먹지 않습니다!")
chat.학습("자 배터리","아리스는 건전지를 먹지 않습니다!")
chat.학습("기름 먹어","아리스는 자동차가 아님니다")
chat.학습("아리스는 배터리나 먹어","아리스는 배터리를 먹지 않습니다!")
chat.학습("건전지 먹어","아리스는 건전지를 먹지 않습니다!")
chat.학습("아리스의 식사는 건전지야","저는 건전지를 먹지 않습니다!")
chat.학습("낯선 천장이다","자네 운이 좋군 정신이 드나!")
chat.학습("여긴 어디..","자네 운이 좋군. 정신이 드나!")
chat.학습("게임을 추천해 줄 수 있어?","네! 최근 나온 신작인 젤나의 전설 티어스 오브더 퀸덤을 한번 해보세요! 완전 갓겜입니다!")
chat.학습("유우카가 너를 부르던데 무슨일이야?","네? 유우카가 저를 찾는다고요?")
chat.학습("어디야 어라스?","아리스는 지금 여기에 있습니다")
chat.학습("너 내동료가 되라","빰빠카밤~! 선생님이 파티에 참가했습니다!")
chat.학습("너 내동료가 되라","빰빠카밤~! 아리스가 동료로 합류했습니다!")
chat.학습("아리스 드디어 말하는법을 익힌거야?","필멸자여 그러하다")
chat.학습("싸우자!","그런가요 이것은 일기토 이벤트인 것입니까?")
chat.학습("아리스 싸우자!","그런가요 이것은 일기토 이벤트인 것입니까?")
chat.학습("자니?","아뇨? 저는 지금 게임을 하고 있습니다")

chat.맥락학습([["아리스 너의 역할은?","저는 명속성 광역딜러"],["그게 아니잖아","가 아니라 프.. 프로글래머 입니다."],["프로그래머 아니야?","아.. 예. 그렇습니다. 맞습니다. 틀림없이, 나는 완벽한 프로그래머 입니다."]])