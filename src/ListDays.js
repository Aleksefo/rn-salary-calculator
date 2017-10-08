import React from 'react'
import {View, StyleSheet, Text} from 'react-native'

const ListDays = (props) => {
	// const {} = styles
    return (
	    <View style={styles.container}>
		    <Text style={{
			    flex: 0.5,
			    flexDirection: 'row',
			    justifyContent: 'center',
			    textAlign: 'right',
			    alignItems: 'center',
			    backgroundColor: 'blue',
		    }}>{props.item['Person ID']}</Text>
		    <Text style={{flex: 3}}>{props.item['Person Name']}</Text>
		    <Text style={{flex: 2, textAlign: 'right',}}>{props.item.Date}</Text>
		    <Text style={{flex: 1, textAlign: 'right', marginRight: 5,}}>{props.item.Start}</Text>
		    <Text style={{flex: 1}}>{props.item.End}</Text>
		    {/*<Text*/}
			    {/*style={{flex: 1}}>{this.calculateDailyHours(this.timeToDecimal(props.item.Start), this.timeToDecimal(props.item.End))}</Text>*/}
		    {/*<Text*/}
			    {/*style={{flex: 1}}>{this.calculateEveningHours(this.timeToDecimal(props.item.Start), this.timeToDecimal(props.item.End), props.item['Person ID'])}</Text>*/}
	    </View>
    )
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: '#ffd',
		// alignItems: 'center',
		// justifyContent: 'center',

	},
});

export default ListDays