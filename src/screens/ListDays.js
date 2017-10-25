import React from 'react'
import {View, StyleSheet, Text} from 'react-native'

// Component used to render CSV shift entries in FlatList
const ListDays = (props) => {
	const {flatList, rowID, rowName, rowDate, rowStart, rowEnd} = styles
	return (
		<View style={flatList}>
			<Text style={rowID}>{props.item['Person ID']}</Text>
			<Text style={rowName}>{props.item['Person Name']}</Text>
			<Text style={rowDate}>{props.item.Date}</Text>
			<Text style={rowStart}>{props.item.Start}</Text>
			<Text style={rowEnd}>{props.item.End}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	flatList: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: '#ffd',
	},
	rowID: {
		flex: 0.75,
		textAlign: 'center',
	},
	rowName: {
		flex: 2,
	},
	rowDate: {
		flex: 2,
		textAlign: 'right',
	},
	rowStart: {
		flex: 1,
		textAlign: 'right',
		marginRight: 5,
	},
	rowEnd: {
		flex: 1,
		textAlign: 'right',
		marginRight: 10,
	},
})

export default ListDays