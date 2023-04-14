import { View, Text } from "react-native";
import { styles } from "./styles";
import * as Progress from 'react-native-progress';

export type ItemListProps = {
    descriptionItem: string,
    checked: boolean,
}    

export type CardListProps = {
    description: string,
    list: ItemListProps[],
    progress: 0 | 1
}    

export function CardList({description, list, progress}: CardListProps){
    return (
        <View style={styles.container}>
            <Text style={styles.textItem}>
                {description}
            </Text>
            <Text style={styles.subTextItem}>
                {list.length} itens
            </Text>
            <Progress.Bar progress={progress} height={5} width={220} color='#EA0BFF' />
        </View>
    )
}