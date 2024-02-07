import { Request, Response } from "express";
import quizJSON from "./JSONData/quiz.json";
import responseJSON from "./JSONData/response.json";
import formatJSON from "./JSONData/format.json";
import sectionJSON from "./JSONData/section.json"
import { news, games, quiz, flight, newsContent, gamesContent, quizContent, flightContent } from "./types"




const express = require("express");



const app = express();

const PORT: number = 4000;

app.use(express.json());

app.post("/scores", (req: Request, res: Response) => {
    const topic: number[] = req.body.topic;
    const format: number[] = req.body.format;
    const source: number[] = req.body.source;



    //* Adding the initial scores to all sections
    function calculatePoints() {
        responseJSON.forEach((sec: quiz | games | news | flight | any) => {

            sec.points = 0;
        });

        //! Quiz section in topic 
        quizJSON.forEach((topicQuiz) => {
            let i = 0
            if (topicQuiz.topic_id === topic[i]) {
                responseJSON.forEach((secName: quiz | any) => {
                    if (secName.section_type === "Quiz") {
                        secName.points += 100;
                    }
                });
                i++;
            }
        });

        for (let i = 0; i < topic.length; i++) {

            //! News in topic 

            responseJSON.forEach((key: news | any) => {
                if (key.section_type === "news" && key.content.some(element => element.topic_id === topic[i])) {
                    key.points += 100;
                }
            });


            //! Format for all the rows
            formatJSON.forEach((element) => {
                if (element.id === format[i]) {
                    let elementType = element.title;
                    //! Conditions for quiz
                    if (elementType === "Playing" || elementType === "Self-practicing") {
                        responseJSON.forEach((secName: quiz | any) => {
                            if (secName.section_type === "Quiz") {
                                secName.points += 10;
                            }
                        });
                    }
                    //! Condition for news
                    if (elementType === "Reading") {
                        responseJSON.forEach((secName: news | any) => {
                            if (secName.section_type === "news") {
                                secName.points += 10;
                            }
                        });
                    }
                    //! Condition for games
                    if (elementType === "Playing") {
                        responseJSON.forEach((secName: games | any) => {
                            if (secName.section_type === "games") {
                                secName.points += 10;
                            }
                        });
                    }
                }
            });

            //! Customm Section  

            responseJSON.forEach((sec: flight | any) => {
                if (sec.section_type === "Flight") {
                    let secContent: flightContent | any = sec.content;
                    secContent.forEach((secCon) => {
                        //!  Format 
                        if (secCon.format_id === format[i]) {
                            sec.points += 10;
                        }
                        // //!Source 
                        if (secCon.source_id === source[i]) {
                            sec.points += 10;
                        }
                    })
                }
            })

            //! Topic 

            for (let j = 0; j < sectionJSON.length; j++) {
                responseJSON.forEach((secName: flight | any) => {
                    if (secName.section_type === "Flight") {
                        sectionJSON.forEach((idFormat) => {
                            if (idFormat.id === secName.section_id) {
                                if (idFormat.topic_id === topic[j]) {
                                    secName.points += 100;
                                }
                            }
                        })
                    }
                })
            }    //* For loop ends here for the topic
        }
    }

    calculatePoints();

    responseJSON.sort((x: news | games | quiz | flight | any, y: news | games | quiz | flight | any) => y.points - x.points);


    res.json(responseJSON);
})


app.listen(PORT, () => console.log("sever started")
)