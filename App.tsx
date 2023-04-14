import { useEffect, useState, useRef } from 'react';
import { Text, 
         View, 
         Pressable, 
         Alert, 
         ActivityIndicator, 
         FlatList, 
         Vibration, 
         TouchableOpacity} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import {Audio, InterruptionModeIOS, InterruptionModeAndroid} from 'expo-av';
import {
  useFonts,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

import { styles } from './src/styles';

import LottieView from 'lottie-react-native';
import AnimatedLottieView from 'lottie-react-native';
import { API_GOOGLE_SPEECH_TO_TEXT } from '@env';

import recordingAnimation from './src/assets/animationAudio.json';
import processingAudioAnimation from './src/assets/processingAudio.json';

import { ItemFromList } from './src/components/ItemFromList';
import { CardList, CardListProps, ItemListProps } from './src/components/CardList';

import { recordingOptions } from './src/utils/recordingOptions';

export default function App() {

  const [fontsLoaded] = useFonts({
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_700Bold
  });

  const instructionText = 
    `Vamos criar uma lista agora? 

    Você pode falar o conteúdo da sua lista
    separando os itens pelo termo "E", por exemplo:
    
    "Pão E manteiga E queijo E ovos."
    OU
    "Tomar café E ler E treinar E ir ao supermercado."
    
    Viu como é simples? Crie sua lista agora.`;

  const [voiceRecord, setVoiceRecord] = useState<Audio.Recording | null>(null);
  const [listItems, setListItems] = useState<ItemListProps[]>([]);
  const [listCollection, setListCollection] = useState<CardListProps[]>([]);
  const [voiceRecordURI, setVoiceRecordURI] = useState<string>('');
  const [recordingAudio, setRecordingAudio] = useState<boolean>(false);
  const [processingAudio, setProcessingAudio] = useState<boolean>(false);

  const lottieRefRecordingAudio = useRef<AnimatedLottieView|null>(null);
  const lottieRefProcessingAudio = useRef<AnimatedLottieView|null>(null);

  useEffect(() => {
    Audio
      .requestPermissionsAsync()
      .then((granted) => {
        if (granted) {
          Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: true,
          });
        }
      });

    setListCollection(
      [
        {
          "description": "Supermercado",
          "list": [
            {"descriptionItem": "pão", "checked": true}, 
            {"descriptionItem": "requeijão", "checked": true}, 
            {"descriptionItem": "queijo", "checked": false}, 
          ],
          "progress": 0.2
        },
        {
          "description": "Atividades da manhã",
          "list": [
            {"descriptionItem": "tomar café", "checked": true}, 
            {"descriptionItem": "ler", "checked": false}, 
            {"descriptionItem": "iniciar o trabalho", "checked": true}, 
            {"descriptionItem": "buscar criança na escola", "checked": true}, 
          ],
          "progress": 0.8
        }
      ]
    );  
  }, []);

  useEffect(() => {
    if (processingAudio) {
      setTimeout(() => {
        lottieRefProcessingAudio.current?.reset();
        lottieRefProcessingAudio.current?.play();
      }, 100);
    } else {
      setTimeout(() => {
        lottieRefProcessingAudio.current?.pause();
      }, 100);      
    }
  }, [processingAudio]);

  useEffect(() => {
    if (lottieRefRecordingAudio.current) {
      setTimeout(() => {
        lottieRefRecordingAudio.current?.reset();
        lottieRefRecordingAudio.current?.play();
      }, 100);
    }
  }, [lottieRefRecordingAudio.current]);

  function getTranscriptionGoogleSpeechToText(base64File: string) {
    setProcessingAudio(true);
    fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${API_GOOGLE_SPEECH_TO_TEXT}`, {
      method: 'POST',
      body: JSON.stringify({
        config: {
          languageCode: "pt-BR",
          encoding: "LINEAR16",
          sampleRateHertz: 44100,
        },
        audio: {
          content: base64File
        }
      })
    })
      .then(response => response.json())
      .then((data) => {
        transcriptionToList(data.results[0].alternatives[0].transcript.toUpperCase());
      })
      .catch((error) => console.log(error))
  }

  async function handlePressIn(){
    Vibration.vibrate(100);

    setRecordingAudio(true);
    setVoiceRecord(null);
    setVoiceRecordURI('');
    setListItems([]);

    const { granted } = await Audio.getPermissionsAsync();

    if (granted) {
      try {
        const { recording } = await Audio.Recording.createAsync(recordingOptions);
        setVoiceRecord(recording);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function handlePressOut(){
    try {
      await voiceRecord?.stopAndUnloadAsync();
      const recordingFileUri = voiceRecord?.getURI();

      if (recordingFileUri) {
        console.log("URI do ARQUIVO => " + recordingFileUri);
        setVoiceRecordURI(recordingFileUri);
        const base64File = await FileSystem.readAsStringAsync(recordingFileUri, { encoding: FileSystem?.EncodingType?.Base64 });
        await FileSystem.deleteAsync(recordingFileUri);

        getTranscriptionGoogleSpeechToText(base64File);
      } else {
        Alert.alert("Audio", "Não foi possível obter a gravação.");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRecordingAudio(false);
    }
  }

  //used in staging environment
  async function handleAudioPlay(){
    console.log('recordingFileURI => ' + voiceRecordURI);
    if (voiceRecordURI){
      const {sound, status} = await Audio.Sound.createAsync({ uri: voiceRecordURI }, {shouldPlay: true});
      console.log(sound, status);
      sound.setPositionAsync(0);
      sound.playAsync();
    }
  }

  function transcriptionToList(transcription: string){
    const list = transcription.split(' E ');

    const formattedItemList = list.map(item => {
      return {
        descriptionItem: item,
        checked: false
      }
    });
    console.log(formattedItemList);

    setProcessingAudio(false);
    setListItems(formattedItemList);
  }

  function handleCancelListCreation(){
    setListItems([]);
  }

  function handleSaveList(){
    setListCollection([{
      description: `Lista criada as ${new Date().toLocaleTimeString()}`,
      list: listItems,
      progress: 0
    }, ...listCollection]);
    setListItems([]);
  }

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  } else {
    return (
      <View style={styles.container}>
        {
          recordingAudio ?          
          <>
            <View style={styles.lottieView}>
              <LottieView
                  ref={lottieRefRecordingAudio}
                  source={recordingAnimation}
                  autoPlay
                  loop  
                  style={{backgroundColor: 'transparent', width: 100, height: 220, margin: 0}}              
              />  
              <Text style={styles.label}>Pode falar agora...</Text>
            </View>  
          </> 
          :
          <>          
          {
            listItems.length > 0 ? (    
              <View style={styles.bodyContainer}>     
                <FlatList 
                  data={listItems}
                  keyExtractor={(item) => String(item.descriptionItem)}
                  renderItem={({ item }) => (
                      <ItemFromList 
                          description={item.descriptionItem}                
                      />
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.list}
                />   
                <View style={styles.containerHandleListButtons}>
                  <TouchableOpacity style={styles.saveListButton} onPress={handleSaveList}>
                    <Text style={styles.textSaveListButton}>
                      Salvar Lista
                    </Text>
                  </TouchableOpacity> 
                  <TouchableOpacity style={styles.cancelListButton} onPress={handleCancelListCreation}>
                    <Text style={styles.textSaveListButton}>
                      Cancelar
                    </Text>
                  </TouchableOpacity> 
                </View>
              </View>   
            ) : (
              <> 
              { processingAudio ? (
                <View style={styles.bodyContainer}> 
                  <View style={styles.lottieView}>
                    <LottieView
                        ref={lottieRefProcessingAudio}
                        source={processingAudioAnimation}
                        autoPlay
                        loop  
                        style={{backgroundColor: 'transparent', width: 100, height: 200, margin: 0}}              
                    />
                  </View> 
                </View> ) : (
                  <View style={styles.bodyContainer}> 
                    { listCollection.length && (
                      <View style={styles.list}>
                        <Text style={styles.myListText}>
                          Minhas Listas
                        </Text>
                        <FlatList 
                          data={listCollection}
                          keyExtractor={(item) => String(item.description)}
                          renderItem={({ item }) => (
                              <CardList 
                                  description={item.description} 
                                  list={item.list}    
                                  progress={item.progress}             
                              />
                          )}
                          showsHorizontalScrollIndicator={false}
                          horizontal
                        /> 
                      </View>
                      ) 
                    }
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={styles.label}>{instructionText}</Text>
                    </View>
                  </View>
                ) 
              }             
              </>
            )
          } 
          </> 
        }  
        <View style={styles.recordButtonContainer}>
          <Pressable 
            style={
              ({ pressed }) => [styles.recordButton || {}, {opacity:pressed ? 0.8 : 1, height:pressed ? 100 : 80, width:pressed ? 100 : 80, borderRadius:pressed ? 50 : 40}]
            }
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <MaterialIcons
              name='mic'
              size={32}
              color='#fff'
            />
          </Pressable>
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }
}
