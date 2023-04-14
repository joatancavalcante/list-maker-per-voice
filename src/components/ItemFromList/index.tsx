import { View, Text } from "react-native";
import { styles } from "./styles";

type ItemFromListProps = {
    description: string
}    

export function ItemFromList({description}: ItemFromListProps){
    return (
        <View style={styles.container}>
            <Text style={styles.textItem}>
                {description}
            </Text>
        </View>
    )
}