import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import Papa from 'papaparse'

export default class App extends React.Component {
	RateHourly = 3.75
	RateEvening = 1.15

	csvData = 'Person Name,Person ID,Date,Start,End\n' +
		'Scott Scala,2,2.3.2014,6:00,14:00\n' +
		'Janet Java,1,3.3.2014,9:30,17:00\n' +
		'Scott Scala,2,3.3.2014,8:15,16:00\n' +
		'Larry Lolcode,3,3.3.2014,18:00,19:00\n' +
		'Janet Java,1,4.3.2014,9:45,16:30\n' +
		'Scott Scala,2,4.3.2014,8:30,16:30\n' +
		'Janet Java,1,5.3.2014,8:00,16:30\n' +
		'Scott Scala,2,5.3.2014,9:00,17:00\n' +
		'Janet Java,1,6.3.2014,8:00,12:00\n' +
		'Janet Java,1,6.3.2014,16:00,22:00\n' +
		'Scott Scala,2,6.3.2014,8:15,17:00\n' +
		'Larry Lolcode,3,6.3.2014,5:00,10:00\n' +
		'Larry Lolcode,3,30.3.2014,8:00,16:00'

	loadCSV() {
		let parsed = Papa.parse(this.csvData, {
			header: true,
			dynamicTyping: false,
			preview: 0,
			encoding: "",
			worker: false,
			comments: false,
			step: undefined,
			complete: undefined,
			error: undefined,
			download: false,
			skipEmptyLines: true,
			chunk: undefined,
			fastMode: undefined,
			beforeFirstChunk: undefined,
			withCredentials: undefined
		})
		console.log(parsed.data)
		// Papa.parse('path/fileName.csv', {
		// 	download: true,
		// 	delimiter: '\t',
		// 	complete: function(results) {
		// 		console.log(results)
		// 	}
		// })
	}

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
	      <Button
		      onPress={() => this.loadCSV()}
		      title="Calculate"
		      color="#841584"
		      accessibilityLabel="Learn more about this purple button"
	      />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
