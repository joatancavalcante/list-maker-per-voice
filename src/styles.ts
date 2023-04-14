import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3350A0',
        alignItems: 'center',
      },  
    label: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '400',
      fontFamily: 'Poppins_400Regular',
      textAlign: 'center',
    },  
    bodyContainer: {
      flex: 1,
      width: '100%',
      marginTop: 40,        
      justifyContent: 'center',
    },
    list: {
      marginTop: 24,
      marginBottom: 8,
      marginLeft: 16
    },  
    recordButtonContainer: {
      marginBottom: 30,
      marginTop: 14
    },  
    recordButton: {
      width: 80,
      height: 80,
      backgroundColor: '#041854',
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#697398',
      margin: 10
    },  
    containerHandleListButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center', 
      gap: 5,
      marginTop: 10     
    },
    saveListButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#041854',
      borderColor: '#FFF',
      borderWidth: 0.4,
      height: 60,
      marginLeft: 10,
      borderRadius: 20,
    },
    cancelListButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      //backgroundColor: '#041854',
      borderColor: '#FFF',
      borderWidth: 0.4,
      height: 60,
      marginRight: 10,
      borderRadius: 20,
    },
    textSaveListButton: {
      fontSize: 16,
      color: '#FFFFFF',
      fontFamily: 'Poppins_300Light',
      textAlign: 'center',
    },
    myListText: {
      fontSize: 16,
      color: '#FFF',
      fontFamily: 'Poppins_400Regular',      
    },
    lottieView: {
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center'
    }
})