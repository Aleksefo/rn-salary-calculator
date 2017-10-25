import React from 'react'
import {Button, FlatList, Linking, StyleSheet, Text, View, AsyncStorage} from 'react-native'
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
		title: 'Salary Calculator'
	})

	componentDidMount() {
		this.loadSavedData()
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

	// Gets callback from AddShiftModal child component when shift is added
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

	// Calculates all CSV data into salaries.
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
		if (start < this.hoursEveningEnd && end < this.hoursEveningEnd) {
			eveningHours += this.hoursEveningEnd - start - end
		}
		if (start < this.hoursEveningEnd && end > this.hoursEveningEnd) {
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
		const {textInput, errorText, flatListTitles, rowID, rowName, rowDate, rowStart, rowEnd, topButtonsGroup, buttonsGroup, button} = styles

		// If URL is incorrect an error message appears
		const parsedError = this.state.parsedError
		let shiftsList = null
		if (parsedError) {
			shiftsList = <Text style={errorText}>Cannot parse salary data. Please check the link for errors.</Text>
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
						iconColor={'#4DA6EF'}
						inputStyle={textInput}
						onChangeText={(url) => this.setState({url})}
					/>
					<View style={topButtonsGroup}>
						<View style={button}>
							<Button
								onPress={() => this.checkURL(this.state.url)}
								title="Load new CSV"
								color="#4DA6EF"
								accessibilityLabel="Load new CSV"
							/>
						</View>
						<View style={button}>
							<Button
								onPress={() => this.setState({parsedData: ''})}
								title="Clear Data"
								color="#4DA6EF"
								accessibilityLabel="Clear Data"
							/>
						</View>
					</View>
					<View style={flatListTitles}>
						<Text style={rowID}>ID</Text>
						<Text style={rowName}>Person Name</Text>
						<Text style={rowDate}>Shift Date</Text>
						<Text style={rowStart}>Start</Text>
						<Text style={rowEnd}>End</Text>
					</View>
					{shiftsList}
				</View>
				<View style={buttonsGroup}>
					<View style={button}>
						<CalculateModal modalVisible={this.state.modalVisible} users={this.state.users}/>
					</View>
					<View style={button}>
						<AddShiftModal modalVisible={this.state.modalVisible} users={this.state.users} onAddShift={this.handleAddShift.bind(this)}/>
					</View>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	textInput: {
		color: '#4DA6EF',
	},
	errorText: {
		flex: 1,
		color: 'red',
		textAlign: 'center',
		fontSize: 15,
	},
	flatListTitles: {
		flexDirection: 'row',
		backgroundColor: '#4DA6EF',
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
	topButtonsGroup: {
		flexDirection: 'row'
	},
	buttonsGroup: {
		flex: 1.5,
		flexDirection: 'row'
	},
	button: {
		flex: 1,
		margin: 5
	},
})
