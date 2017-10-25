import React from 'react';
import {Button, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View, AsyncStorage} from 'react-native';
import Papa from 'papaparse'
import {Sae} from 'react-native-textinput-effects'
import {FontAwesome} from '@expo/vector-icons'
import ListDays from './ListDays'
import CalculateModal from './CalculateModal'
import AddShiftModal from './AddShiftModal'


export default class HomeScreen extends React.Component {

	state = {
		modalVisible: false,
		currentDate: '',
		parsedData: [],
		parsedError: false,
		users: {},
		url: 'https://raw.github.com/Aleksefo/rn-salary-calculator/master/src/dataList.csv'
	}

	// Hourly wage for all employees
	rateHourly = 3.75
	// Evening work compensation for hours between hoursEveningStart and hoursEveningEnd
	rateEvening = 1.15
	hoursEveningStart = 18
	hoursEveningEnd = 6
	// Overtime bonus. Each value adds to sum of previous value, i.e. rateOvertimeRest bonus is 0.5+0.25+0.25
	// Overtime compensation is paid when daily working hours exceeds normal hours.
	hoursNormaltime = 8
	hoursOvertimeFirstHours = 2
	hoursOvertimeNextHours = 2
	rateOvertimeFirstHours = 0.25  // Hourly Wage + 25%
	rateOvertimeNextHours = 0.25   // Hourly Wage + 50%
	rateOvertimeRest = 0.5      // Hourly Wage + 100%

	// Navigation options for React Navigation
	static navigationOptions = ({navigation}) => ({
		title: 'Salary Calculator',

		headerRight: <TouchableOpacity onPress={() => navigation.navigate('Add')}>
			{/*<Icons name="ios-car" size={28} color="white" />*/}
			<Text style={styles.add}>Settings</Text>
		</TouchableOpacity>,
	})

	componentDidMount() {
		// this.checkURL(this.state.url)
		this.loadSavedData()
		// this.preCalculateWages(this.state.parsedData)
	}

	// Loads CSV data from local storage
	async loadSavedData() {
		try {
			await AsyncStorage.getItem('CSVData')
				.then(JSON.parse).then(CSVData => {
					if (CSVData !== null) {
						this.setState({parsedData: CSVData})
						this.preCalculateWages(CSVData)
					} else {
						console.log('nothing to load')
					}
				})
		} catch (error) {
			console.log('loadSavedData error ' + error)
		}
	}

	// Saves CSV data to local storage
	async saveDataLocally(data) {
		try {
			await AsyncStorage.setItem('CSVData', JSON.stringify(data))
		} catch (error) {
			console.log('saveDataLocally error ' + error)
		}
	}

	// Loads CSV from a remote source, sets the parsed data as State to render it as a list later, and runs salary calculation function
	loadCSV(url) {
		let that = this
		Papa.parse(url, {
			download: true,
			complete: function (results) {
				that.setState({parsedData: results.data, parsedError: false})
				that.saveDataLocally(results.data)
				that.preCalculateWages(results.data)
			},
			error: function (err, file, inputElem, reason) {
				that.setState({parsedError: true})
			},
			header: true,
			skipEmptyLines: true,
		})
	}

	// Get's callback from AddShiftModal child component
	handleAddShift() {
		this.loadSavedData()
	}

	// Checks URL for being an actual URL
	checkURL(url) {
		Linking.canOpenURL(url).then(supported => {
			if (!supported) {
				this.setState({parsedError: true})
			} else {
				return this.loadCSV(url)
			}
		}).catch(err => console.error('An error occurred', err))
	}

	//Calculates all CSV data into salaries.
	preCalculateWages(results) {
		let objs = []
		let toState = []
		results.map(entry => {
			let hoursCombo
			let worked = ''
			let overtimeMultipliedHours = 0
			// Check for existing entry to prevent Undefined error
			if (objs[entry['Person ID']] === undefined) {
				objs[entry['Person ID']] = {
					name: entry['Person Name'],
					eveningHours: 0,
					overtimeMultipliedHours: 0,
					hoursCombo: 0,
					worked: ''
				}
			}
			// Get evening hours and add them to total eveningHours
			let eveningHours = this.calculateEveningHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End))
			eveningHours += objs[entry['Person ID']].eveningHours
			// Gets total hours for a day
			let todayHours = this.calculateDailyHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End))
			// Overtime calculations. If it's still the same day, add hours from the shift to total hours worked today, otherwise calculates overtime hours
			if (entry.Date === objs[entry['Person ID']].worked) {
				hoursCombo = objs[entry['Person ID']].hoursCombo + todayHours
			} else {
				worked = entry.Date
				hoursCombo = objs[entry['Person ID']].hoursCombo
				overtimeMultipliedHours = this.calculateOvertimeHours(hoursCombo)
				overtimeMultipliedHours += objs[entry['Person ID']].overtimeMultipliedHours
				hoursCombo = todayHours
			}
			// Saves the data as an object with temporary calculation values
			objs[entry['Person ID']] = {name: entry['Person Name'], eveningHours, overtimeMultipliedHours, hoursCombo, worked}
		})
		//Second part. Uses temporary values to calculate the total salary
		objs.map(
			(entry, index) => {
				// Calculates the overtime of a last day if any exists.
				let lastDayOvertime = this.calculateOvertimeHours(entry.hoursCombo)
				let totalHours = entry.overtimeMultipliedHours + lastDayOvertime
				let name = entry.name
				let rawSalary = totalHours * this.rateHourly + entry.eveningHours * this.rateEvening
				// Rounds the salary to cents
				let salary = Math.round(rawSalary * 100) / 100
				toState[index - 1] = {name, salary}
			}
		)
		// Saves the salary data to the state.
		this.setState({users: toState})
	}

	// Converts CSV time to decimal value
	timeToDecimal(t) {
		let arr = t.split(':')
		return parseFloat(parseInt(arr[0], 10) + '.' + parseInt((arr[1] / 6) * 10, 10))
	}

	// Calculates Difference between Start and End time
	calculateDailyHours(start, end) {
		return end + (end < start ? 24 : 0) - start
	}

	// Calculates Difference between Start and End time for extra evening pay
	calculateEveningHours(start, end) {
		let eveningHours = 0
		// Check if Overtime ended the same day or next
		end = end + (end < start ? 24 : 0)
		// Calculations depending on when Evening hours start and end
		if ((24 + this.hoursEveningEnd) > end && end > this.hoursEveningStart) {
			eveningHours += end - ( start > this.hoursEveningStart ? 24 : this.hoursEveningStart )
		}
		if ((24 + this.hoursEveningEnd) < end) {
			eveningHours += (24 + this.hoursEveningEnd) - ( start > this.hoursEveningStart ? 24 : this.hoursEveningStart )
		}
		if (start > this.hoursEveningStart) {
			eveningHours += 24 - start
		}
		if (start < this.hoursEveningEnd) {
			eveningHours += this.hoursEveningEnd - start
		}
		return eveningHours
	}

	// Calculates overtime bonus, based on hours worked per day. Returns a multiplied number of hours
	calculateOvertimeHours(hours) {
		let extraHours = hours
		let normal = this.hoursNormaltime
		let firstHours = this.hoursNormaltime + this.rateOvertimeFirstHours
		let nextHours = this.hoursOvertimeFirstHours + this.hoursOvertimeNextHours + this.hoursNormaltime
		if (hours > normal) {
			extraHours += ( hours - normal ) * this.rateOvertimeFirstHours
			if (hours > (firstHours)) {
				extraHours += ( hours - firstHours ) * this.rateOvertimeNextHours
				if (hours > nextHours) {
					extraHours += ( hours - nextHours ) * this.rateOvertimeRest
				}
			}
		}
		return extraHours
	}


	render() {

		// If URL is incorrect an error message appears
		const parsedError = this.state.parsedError
		let shiftsList = null
		if (parsedError) {
			shiftsList = <Text>Cannot parse salary data. Please check the link for errors.</Text>
		} else {
			shiftsList =
				<FlatList
					data={this.state.parsedData}
					keyExtractor={(item, index) => index}
					renderItem={({item}) =>
						<ListDays item={item}/>
					}
				/>
		}

		return (
			<View style={{flex: 1}}>
				<View style={{flex: 18}}>
					<Sae
						label={'Paste your CSV link here'}
						iconClass={FontAwesome}
						iconName={'pencil'}
						iconColor={'green'}
						// TextInput props
						onChangeText={(url) => this.setState({url})}
					/>
					<View style={{flexDirection: 'row'}}>
						<View style={{flex: 1}}>
							<Button
								onPress={() => this.checkURL(this.state.url)}
								title="Load new CSV"
								color="#841884"
								accessibilityLabel="Load new CSV"
							/>
						</View>
						<View style={{flex: 1}}>
							<Button
								onPress={() => this.setState({parsedData: ''})}
								title="Clear Data"
								color="#841884"
								accessibilityLabel="Clear Data"
							/>
						</View>
					</View>
					<Button
						// onPress={() => this.setModalVisible(true)}
						onPress={() => console.log(this.state)}
						title="CurrentState"
						color="#841884"
						accessibilityLabel="Learn more about this purple button"
					/>
					<Button
						// onPress={() => this.setModalVisible(true)}
						onPress={() => this.preCalculateWages(this.state.parsedData)}
						title="Calculate"
						color="#841884"
						accessibilityLabel="Learn more about this purple button"
					/>
					{shiftsList}
				</View>
				<View style={{flex: 1, flexDirection: 'row'}}>
					<View style={{flex: 1}}>
						<CalculateModal modalVisible={this.state.modalVisible} users={this.state.users}/>
					</View>
					<View style={{flex: 1}}>
						<AddShiftModal modalVisible={this.state.modalVisible} users={this.state.users} onAddShift={this.handleAddShift.bind(this)}/>
					</View>
				</View>
			</View>
		);
	}
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
