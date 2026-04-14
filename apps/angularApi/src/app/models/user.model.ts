import { SkillDto } from './skilldto.model';

export interface User {
imagePath: any;
  id: string;
  name: string;
  email: string;
  bio?: string;
  profileImage?: string;
  createdAt?: string;
  skillsToTeach?: SkillDto[];
  skillsToLearn?: SkillDto[];
}
