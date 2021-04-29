import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Slider from "@material-ui/core/Slider";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import { PieChart } from "react-minimal-pie-chart";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  layout: {
    width: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 600,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  input: {
    padding: 10,
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

// Keto Core

const errorHandling = (
  bodyfat,
  essentialBodyFat,
  minimumFoodIntake,
  maintenanceCalorieIntake,
  maxFatInGrams,
  desirableFatInGrams,
  desirableFoodIntake,
  warnings,
  setWarnings
) => {
  const Warnings = {
    //
    // Essential bodyfat is too low
    //
    LOW_BODYFAT: 1 << 0,

    //
    // Fat intake (in grams) required to meet desirable level is too low (less then 30g)
    //
    LOW_FATGRAMS: 1 << 1,

    //
    // Calories required to meet desirable level are way too low (less than 1200 kcal)
    //
    LOW_CALORIES: 1 << 2,

    //
    // Net Carbs limit set too high making it impossible to meet desirable targets
    //
    HIGH_CARBS: 1 << 3,
  };

  // Body Fat too low

  let nonEssentialBodyFat = bodyfat - essentialBodyFat;

  if (nonEssentialBodyFat < 0) {
    nonEssentialBodyFat = 0;
    var bodyFatTooLow = true;
  } else {
    var bodyFatTooLow = false;
  }

  if (bodyFatTooLow) {
    setWarnings("LOW_BODYFAT");
  } else if (minimumFoodIntake >= maintenanceCalorieIntake) {
    setWarnings("HIGH_CARBS");
  }

  // Max fat in grams
  if (maxFatInGrams < 0) {
    maxFatInGrams = 0;
    setWarnings("HIGH_CARBS");
  }

  if (desirableFatInGrams < 0) {
    desirableFatInGrams = 0;
    setWarnings("HIGH_CARBS");
  }

  //   if (desirable.gramsFat < 30) {
  //     setWarnings("LOW_FATGRAMS");
  //   }

  if (desirableFoodIntake < 1200) {
    setWarnings("LOW_CALORIES");
  }

  // Set warnings
  switch (warnings) {
    default:
    case "LOW_CALORIES":
      console.log("Calorie inname te laag");
      break;
    case "LOW_BODYFAT":
      console.log("Vetpercentage te laag");
      break;
    case "LOW_FATGRAMS":
      console.log("Vet inname te laag");
      break;
    case "HIGH_CARBS":
      console.log("Koolhydraatinname te hoog");
      break;
  }
};
//
//

//
// Calculate macronutrient ratios in grams, calories and percentages based on fat, protein & carbs
//
const calculateMacronutrientRatio = (fatGrams, proteinGrams, netCarbGrams) => {
  var kcalFat = fatGrams * 9;
  var kcalProtein = proteinGrams * 4;
  var kcalNetCarbs = netCarbGrams * 4;
  var kcalTotal = kcalNetCarbs + kcalProtein + kcalFat;

  if (kcalTotal <= 0) {
    return;
  }

  var result = {};
  result.energy = Math.round(kcalTotal);
  result.gramsFat = Math.round(fatGrams);
  result.gramsProtein = Math.round(proteinGrams);
  result.gramsNetCarbs = Math.round(netCarbGrams);
  result.energyFat = Math.round(kcalFat);
  result.energyProtein = Math.round(kcalProtein);
  result.energyNetCarbs = Math.round(kcalNetCarbs);
  result.percEnergyNetCarbs = Math.round((100 * kcalNetCarbs) / kcalTotal);
  result.percEnergyProtein = Math.round((100 * kcalProtein) / kcalTotal);
  result.percEnergyFat = Math.round(
    100 - (result.percEnergyNetCarbs + result.percEnergyProtein)
  );
  return result;
};

function App() {
  const classes = useStyles();
  // SET VARIABLES
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState(35);
  const [weight, setWeight] = useState(80);
  const [bodyfat, setBodyfat] = useState(20);
  const [essentialBodyFat, setEssentialBodyFat] = useState(3);
  const [height, setHeight] = useState(180);
  const [activityLevel, setActivityLevel] = useState(0.5);
  const [netCarbs, setNetCarbs] = useState(30);
  const [calorieAdjustment, setCalorieAdjustment] = useState(-15);
  const [bmr, setBmr] = useState(1745);
  const [warnings, setWarnings] = useState();
  //
  // DEFINE RESULT OBJECTS
  const [minimum, setMinimum] = useState();
  const [maintenance, setMaintenance] = useState();
  const [desirable, setDesirable] = useState();

  //
  // GENERAL USEEFFECT FOR UPDATING FORM FIELDS
  //
  useEffect(() => {
    //
    // Calculate Protein Level for given activity level
    //
    const activityProteinMin = 1.3;

    const activityProteinMax = 2.2;

    const activityProteinFactor =
      activityProteinMin +
      (activityProteinMax - activityProteinMin) * activityLevel;

    const leanMass = ((100 - bodyfat) * weight) / 100;

    const longTermProteinIntake = leanMass * activityProteinFactor;

    //
    // Calculate calorie intake for maintenance level
    // Note: Using polynomial curve fitting function
    //
    const activityBmrFactor =
      1.0999999999999945 +
      -2.3333333333231288e-1 * activityLevel +
      3.7999999999943399 * Math.pow(activityLevel, 2) +
      -5.8666666666573466 * Math.pow(activityLevel, 3) +
      3.199999999995319 * Math.pow(activityLevel, 4);

    const maintenanceCalorieIntake = bmr * activityBmrFactor * 1.1;

    //
    //

    //
    // Calculate calories based on fat, protein & carbs
    //
    const calculateCalorieIntakeFromMacronutrients = (
      fatGrams,
      proteinInGrams,
      netCarbsInGrams
    ) => {
      return fatGrams * 9 + proteinInGrams * 4 + netCarbsInGrams * 4;
    };

    //
    //

    //
    // Calculate fat intake in grams to meet calorie requirements for a given protein and carbs intake
    //
    const calculateFatIntakeInGrams = (
      calorieIntake,
      proteinInGrams,
      netCarbsInGrams
    ) => {
      var proteinKCals = proteinInGrams * 4;
      var carbsKCals = netCarbsInGrams * 4;
      var fatKCals = calorieIntake - (proteinKCals + carbsKCals);
      var fatGrams = fatKCals / 9;
      return fatGrams;
    };

    //
    // Calculate essential and non-essential bodyfat
    //

    //
    //

    //
    // Calculate macronutrient ratios for maintenance, minimum & desirable
    // levels. The adjustment factor determines the desirable calorie deficit or surplus. A positive value of 5
    // will result in 5% calorie surplus for weight/ muscle gain where a negative -5% will result in a 5% calorie
    // deficit for weight/ fat loss
    //
    // The resulting data is a collection of macronutrient ratios as calculated by calculateMacronutrientRatio.
    //

    //result.adjustment = calorieAdjustment;

    const nonEssentialFatMass = ((bodyfat - essentialBodyFat) * weight) / 100;

    let maxFatInGrams = calculateFatIntakeInGrams(
      maintenanceCalorieIntake,
      longTermProteinIntake,
      netCarbs
    );

    let minimumFoodIntake =
      maintenanceCalorieIntake - 69.2 * Math.max(0, nonEssentialFatMass);

    let minFatInGrams = calculateFatIntakeInGrams(
      minimumFoodIntake,
      longTermProteinIntake,
      netCarbs
    );

    if (minFatInGrams < 30) {
      minFatInGrams = 30;
      minimumFoodIntake = calculateCalorieIntakeFromMacronutrients(
        minFatInGrams,
        longTermProteinIntake,
        netCarbs
      );
    }

    const desirableFoodIntake =
      maintenanceCalorieIntake +
      (calorieAdjustment * maintenanceCalorieIntake) / 100;

    let desirableFatInGrams = calculateFatIntakeInGrams(
      desirableFoodIntake,
      longTermProteinIntake,
      netCarbs
    );
    // get the results
    const resultMaintenance = calculateMacronutrientRatio(
      maxFatInGrams,
      longTermProteinIntake,
      netCarbs
    );
    const resultMinimum = calculateMacronutrientRatio(
      minFatInGrams,
      longTermProteinIntake,
      netCarbs
    );
    const resultDesirable = calculateMacronutrientRatio(
      desirableFatInGrams,
      longTermProteinIntake,
      netCarbs
    );
    setMinimum(resultMinimum);
    setMaintenance(resultMaintenance);
    setDesirable(resultDesirable);
    errorHandling(
      bodyfat,
      essentialBodyFat,
      minimumFoodIntake,
      maintenanceCalorieIntake,
      maxFatInGrams,
      desirableFatInGrams,
      desirableFoodIntake,
      warnings,
      setWarnings
    );
  }, [
    age,
    weight,
    height,
    bodyfat,
    activityLevel,
    netCarbs,
    bmr,
    calorieAdjustment,
    essentialBodyFat,
    warnings,
  ]);
  //
  //

  //
  // UDPATE BMR VALUE BASED ON RELEVANT FIELDS
  //

  useEffect(() => {
    const genderBmr = (gender) => {
      //
      // Set bmr values per gender
      //
      switch (gender) {
        default:
        case "Female":
          //
          // female: 9.99 x weight (kg) + 6.25 x height (cm) - 4.92 x age (y) - 161
          //
          setBmr(9.99 * weight + 6.25 * height - 4.92 * age - 161);
          setEssentialBodyFat(8);

          break;
        case "Male":
          //
          // male:    9.99 x weight (kg) + 6.25 x height (cm) - 4.92 x age (y) + 5
          //
          setBmr(9.99 * weight + 6.25 * height - 4.92 * age + 5);
          setEssentialBodyFat(3);

          break;
      }
    };
    genderBmr(gender);
  }, [gender, height, weight, age]);
  //
  //

  //   var calorieAdjustments =
  //     result.adjustment < 0
  //       ? -result.adjustment + "% deficit"
  //       : result.adjustment + "% surplus";

  const handleGenderChange = (event) => {
    setGender(event.target.value);
    console.log(gender);
  };

  const handleActivitySliderChange = (event, newActivityValue) => {
    setActivityLevel(newActivityValue);
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="sm">
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            Gegevens
          </Typography>
          <form>
            <Grid
              container
              direction="column"
              justify="flex-end"
              alignItems="center"
            >
              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  aria-label="Geslacht"
                  name="gender1"
                  value={gender}
                  onChange={handleGenderChange}
                >
                  <Grid container direction="row" alignItems="center">
                    <FormControlLabel
                      value="Female"
                      control={<Radio />}
                      label="Vrouw"
                    />
                    <FormControlLabel
                      value="Male"
                      control={<Radio />}
                      label="Man"
                    />
                  </Grid>
                </RadioGroup>
              </FormControl>

              <TextField
                label="Leeftijd"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              ></TextField>
              <TextField
                label="gewicht"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              ></TextField>
              <TextField
                label="lengte"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              ></TextField>
              <TextField
                label="vetpercentage"
                value={bodyfat}
                onChange={(e) => setBodyfat(e.target.value)}
              ></TextField>
              <TextField
                label="hoeveelheid koolhydraten"
                value={netCarbs}
                onChange={(e) => setNetCarbs(e.target.value)}
              ></TextField>
              <Typography id="discrete-slider" gutterBottom>
                Activiteitsniveau
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item>niet actief</Grid>
                <Grid item xs>
                  <Slider
                    value={activityLevel}
                    onChange={handleActivitySliderChange}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="auto"
                    step={0.2}
                    min={0}
                    max={1}
                  />
                </Grid>
                <Grid item>heel actief</Grid>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
      <div>
        <h3>Resultaten</h3>
        <Results
          calorieAdjustment={100}
          minimum={minimum}
          desirable={desirable}
          maintenance={maintenance}
          bmr={bmr}
        />
      </div>
    </div>
  );
}

export default App;

const Results = ({
  calorieAdjustment,
  minimum,
  maintenance,
  desirable,
  bmr,
}) => {
  return (
    <div>
      <table>
        <tbody>
          <ResultsSectionItem
            name="Calorie Desirable Adjustment"
            value={calorieAdjustment}
          />
          {/* <ResultsSectionItem name="Warnings" value={warnings} /> */}
        </tbody>
      </table>
      <h4>Calculated Basal Metabolic Rate (BMR): {Math.round(bmr)} kcal </h4>
      <ResultsSection {...minimum} />
      <h4>Maintenance</h4>
      <ResultsSection {...maintenance} />
      <h4>Desirable</h4>
      <ResultsSection {...desirable} />
    </div>
  );
};

const ResultsSection = (results) => {
  const energy = results.energy + " kcal";
  var macroGrams =
    results.gramsFat +
    "g, " +
    results.gramsProtein +
    "g, " +
    results.gramsNetCarbs +
    "g";
  var macroEnergy =
    results.energyFat +
    " kcal, " +
    results.energyProtein +
    " kcal, " +
    results.energyNetCarbs +
    " kcal";
  var macroPercEnergy =
    results.percEnergyFat +
    "%, " +
    results.percEnergyProtein +
    "%, " +
    results.percEnergyNetCarbs +
    "%";

  return (
    <div>
      <Table>
        <TableBody>
          <ResultsSectionItem name="Energy" value={energy} />
          <ResultsSectionItem
            name="Fat/ Protein/ Net Carbs grams"
            value={macroGrams}
          />
          <ResultsSectionItem
            name="Fat/ Protein/ Net Carbs energy"
            value={macroEnergy}
          />
          <ResultsSectionItem
            name="Fat/ Protein/ Net Carbs %"
            value={macroPercEnergy}
          />
        </TableBody>
      </Table>
      <Container maxWidth="sm">
        <Paper>
          <PieChart
            data={[
              { title: "One", value: results.gramsFat, color: "#ff8038" },
              { title: "Two", value: 15, color: "#C13C37" },
              { title: "Three", value: 20, color: "#6A2135" },
            ]}
            radius={PieChart.defaultProps.radius - 6}
            lineWidth={60}
            segmentsStyle={{ transition: "stroke .3s", cursor: "pointer" }}
            segmentsShift={3}
            animate
            label={({ dataEntry }) => Math.round(dataEntry.percentage) + "%"}
            labelStyle={{
              fill: "#fff",
              opacity: 0.75,
              pointerEvents: "none",
            }}
          />
        </Paper>
      </Container>
    </div>
  );
};

export const ResultsSectionItem = ({ name, value }) => {
  return (
    <tr>
      <td>{name}</td>
      <td>{value}</td>
    </tr>
  );
};
