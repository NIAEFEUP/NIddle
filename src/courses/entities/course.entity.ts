import { Faculty } from "src/faculties/faculty.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Course {
    /**
     * The unique identifier of the course.
     * @example 1
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * The name of the course.
     * @example 'Bachelor in Informatics and Computing Engineering'
     */
    @Column()
    name: string;

    /**
     * The acronym of the course.
     * @example 'LEIC'
     */
    @Column()
    acronym: string;

    /**
     * The faculties associated with the course.
     * @example [{ id: 1, name: 'Faculty of Engineering', acronym: 'FEUP' }]
     */
    @ManyToMany(() => Faculty, (faculty) => faculty.courses)
    faculties: Faculty[];
}
