// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, YellowBox, Image } from 'react-native';
import firebase from "firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "firebase/firestore";
import {InputToolbar, Send, Composer, Bubble, GiftedChat} from "react-native-gifted-chat";
import { Octicons } from '@expo/vector-icons'; 
import Constants from 'expo-constants';
import { Entypo } from '@expo/vector-icons'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 


const statusheight = Constants.statusBarHeight;

const firebaseConfig = {
  apiKey: "AIzaSyAz1BMVbYsRJyC9T8OtViVljH3v0XvgqP4",
  authDomain: "minichat-49c76.firebaseapp.com",
  projectId: "minichat-49c76",
  storageBucket: "minichat-49c76.appspot.com",
  messagingSenderId: "612449667704",
  appId: "1:612449667704:web:0d0f93347792f89da77b8d"
};

if(firebase.apps.length == 0){
  firebase.initializeApp(firebaseConfig);
}

YellowBox.ignoreWarnings(["Setting a timer for a long period of time"])

const db = firebase.firestore();
const chatsRef = db.collection("chats");

export default function App() { 
  const [user, setUser] = useState(null);
  const [name, setName] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    readUser()
    const unsuscribe = chatsRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot.docChanges().filter(({type}) => type == "added")
        .map(({doc}) => {
          const message = doc.data()
          return { ...message, createdAt: message.createdAt.toDate() }
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendMessages(messagesFirestore)
    })
    return () => unsuscribe()
  }, [])

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser(){
    const user = await AsyncStorage.getItem("user")
    if(user){
      setUser(JSON.parse(user))
    }
  }

  async function handlePress(){
    const _id = Math.random().toString(36).substring(7);
    const user = {_id, name}
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }

  async function handleSend(messages){
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes);
  }

  if(!user){
    return (<View style={styles.container}>
      <Image style={styles.imageprincipal} source={require("./assets/title.png")}/>
      <View style={styles.apodback}>  
        <Text style={styles.apodointro}>Tu Apodo:</Text>
      </View> 
      <TextInput style={styles.input} value={name} placeholder="Ingrese el nombre..." onChangeText={setName} />
      <TouchableOpacity onPress={handlePress} style={styles.ingresarbotton}>
        <Text style={styles.textobotton}>Ingresar al Chat</Text>
      </TouchableOpacity>
      <StatusBar style="dark" />
    </View>)
  }

  function renderComposer(props){
    return ( <Composer
      {...props}
      placeholder={'Escribe un texto...'}
      /> 
    ); 
  }

  function renderBubble(props) {
    return (
        <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: 'whitesmoke',
                padding:4,
                borderRadius:6,
              },
              right: {
                  backgroundColor:"#CE009B",
                  padding:4,
                  borderRadius:6,
              }
            }}
        />
    );
  }

  function renderSend(props) {
    return <Send {...props}>
      <MaterialCommunityIcons style={styles.sendcircle} name="send-circle" size={40} color="#CE009B" />
    </Send>
  }

  function renderInputToolbar(props) {
    return <InputToolbar {...props} containerStyle={styles.inputToolbar} />
  }

  async function deleteUser(){
    await AsyncStorage.removeItem("user")
    setUser(null);
  }

  return (
      <View style={styles.chatroom}>
        <View style={styles.navchat}>
          <View style={styles.titlarea}>
            <Image style={styles.iconsplash} source={require("./assets/icon-splash.png")}/>
            <Text style={styles.logouttext}>MiniChat</Text>
          </View>
          
          <TouchableOpacity style={styles.logoutarea} onPress={deleteUser}>
            <Octicons name="sign-out" size={22} color="white" style={{marginTop:3}}/>
          </TouchableOpacity>
        </View>
        <GiftedChat messages={messages} user={user} onSend={handleSend} renderBubble={renderBubble} renderInputToolbar={renderInputToolbar} renderComposer={renderComposer} renderSend={renderSend}/>
        <StatusBar style="light" backgroundColor="#CE009B" />
      </View>
  );
}

const styles = StyleSheet.create({
  iconsplash:{
    width:30,
    height:30,
  },
  ingresarbotton:{
    backgroundColor:"#CE009B",
    borderRadius:4,
    padding:15,
  },
  textobotton:{
    color:"white",
    fontWeight:"bold",
  },
  apodointro:{
    marginTop:5,
    marginBottom:10,
    color:"grey",
    opacity:.5,
  },
  container: {
    marginTop:statusheight,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding:30,
  },
  imageprincipal:{
    height:40,
    width:180,
    marginBottom:30,
    marginTop:-60,
  },
  imagelogonav:{
    height:40,
    width:40,
    marginLeft:-5,
    marginRight:-5,
  }, 
  sendcircle:{
    padding:2,
  },
  inputToolbar:{
    backgroundColor:"#FBFAFD",
    borderTopColor:"#D7BFF0"
  },
  sendIcon:{
    color:"#520F9A",
  },
  titlarea:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
  },
  logoutarea:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
  },
  logouttext:{
    fontWeight:"bold",
    fontSize:17,
    marginRight:8,
    marginLeft:8,
    marginBottom:2,
    color:"white",
    opacity:.9,
  },
  logouttext2:{
    fontWeight:"bold",
    fontSize:12,
    marginRight:8,
    marginLeft:8,
    marginBottom:2,
    color:"white",
    opacity:.9,
  },
  navchat:{
    height:60,
    padding:15,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:"#CE009B",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 6,
  },
  littlelogo:{
    height:40,
    width:160,
  },
  chatroom:{
    flex:1,
    marginTop:statusheight,
  },
  apodback:{
    width:"100%",
  },
  input:{
    height:50,
    width:"100%",
    borderWidth:1,
    padding:15,
    borderColor:"#F5BDE7",
    marginBottom:20,
  }
});
