import React from 'react';

import {
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    IonText,
    IonTitle
} from '@ionic/react';

import Layout from '../layout/Layout';
import { QuestionAnswer } from './types';

import './Model.css';

/**
 * 
 */
interface Props {
    widgetTitle: string;
    pageTitle: string;
    questionsAnswers: QuestionAnswer[];
}

/**
 * 
 * @param param0 
 * @returns 
 */
const FAQModel: React.FC<Props> = ({ widgetTitle, pageTitle, questionsAnswers }: Props) => {

    return (
        <Layout
            contentClassName=''
            widgetTitle={widgetTitle}
        >
            <div className='title-wrapper mt-3 mb-8'>
                <IonTitle className='FAQTopic-title FAQTopic-page-title title-color font-xl'>{pageTitle}</IonTitle>
            </div>
            <IonAccordionGroup
                class="questions-answers-accordion-group"
            >
                <div className="questions-answers-wrapper">
                {
                    questionsAnswers.map((question_answer, index) => (
                        <IonAccordion
                            value={`${index}`}
                            key={index}
                        >
                            <IonItem slot="header">
                                <IonLabel class="question-answer-question ion-text-wrap title-color font-md">{question_answer.question}</IonLabel>
                            </IonItem>
                            <div
                                slot="content"
                                className="ion-padding"
                            >
                                <IonText className='question-answer-answer content-color fs-7'>{question_answer.answer}</IonText>
                            </div>
                        </IonAccordion>
                    ))
                }
                </div>
            </IonAccordionGroup>
        </Layout>
    );
};

export default FAQModel;
