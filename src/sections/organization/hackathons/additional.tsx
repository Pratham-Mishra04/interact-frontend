import type React from 'react';
import Checkbox from '@/components/form/checkbox';

interface IntegrationProps {
  github: boolean;
  setGithub: React.Dispatch<React.SetStateAction<boolean>>;
  figma: boolean;
  setFigma: React.Dispatch<React.SetStateAction<boolean>>;
  autoCodeReview: boolean;
  setAutoCodeReview: React.Dispatch<React.SetStateAction<boolean>>;
  projectEditing: boolean;
  setProjectEditing: React.Dispatch<React.SetStateAction<boolean>>;
  projectPublic: boolean;
  setProjectPublic: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdditionalDetails: React.FC<IntegrationProps> = ({
  github,
  setGithub,
  figma,
  setFigma,
  autoCodeReview,
  setAutoCodeReview,
  projectEditing,
  setProjectEditing,
  projectPublic,
  setProjectPublic,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-primary_danger">You will not be able to edit this section later.</div>
      <Checkbox
        label="Do you want to allow project editing during judging?"
        val={projectEditing}
        setVal={setProjectEditing}
        caption={
          projectEditing
            ? 'Project editing is allowed during Judging.'
            : 'Project editing is not allowed during Judging.'
        }
      />
      <Checkbox
        label="Do you want to make the projects public after the hackathon ends?"
        val={projectPublic}
        setVal={setProjectPublic}
        caption={
          projectPublic
            ? 'Projects will be made public on Interact and will be displayed on the Hackathon page after the Hackathon ends.'
            : 'Projects will remain private after the Hackathon ends.'
        }
      />
      <Checkbox
        label="Will your Hackathon need Github integration?"
        val={github}
        setVal={setGithub}
        caption={
          github
            ? 'Github Integration is included in your Hackathon. It will track commits and code changes made by the participants for analytics.'
            : 'Github Integration is not included in your Hackathon.'
        }
      />
      {github && (
        <Checkbox
          label="Do you want to include Automatic Code Reviews?"
          val={autoCodeReview}
          setVal={setAutoCodeReview}
          caption={
            autoCodeReview
              ? 'Automatic code reviews for connected Github repositories will be generated 15-30 minutes before each judging round which will be visible to the judges.'
              : 'Auto Code Review is not included in your Hackathon.'
          }
        />
      )}
      <Checkbox
        label="Will your Hackathon need Figma integration?"
        val={figma}
        setVal={setFigma}
        caption={
          figma
            ? 'Figma Integration is included in your Hackathon. It will track figma file changes made by the participants for analytics.'
            : 'Figma Integration is not included in your Hackathon.'
        }
      />
    </div>
  );
};

export default AdditionalDetails;
